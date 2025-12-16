import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
// Sửa import này: Dùng hàm mới để tạo Access/Refresh Token
import { sendTokenResponse } from "../utils/generateToken.js"; 
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const PEPPER_SECRET = process.env.PEPPER_SECRET;

// --- Helper: Pepper Logic ---
const addPepper = (password) => {
  if (!PEPPER_SECRET) {
    throw new Error("Missing PEPPER_SECRET in .env file");
  }
  return crypto
    .createHmac("sha256", PEPPER_SECRET)
    .update(password)
    .digest("hex");
};

export const userRegister = async (req, res) => {
  try {
    const { username, password, name, phone, role, email } = req.body;

    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        message: "Tên người dùng đã tồn tại",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordWithPepper = addPepper(password);
    const hashedPassword = await bcrypt.hash(passwordWithPepper, salt);

    user = new User({
      username: username,
      password: hashedPassword,
      name: name,
      phone: phone,
      role: role || "guest",
      email: email,
      emailVerified: false,
    });

    // Generate verification code and send email
    const code = user.generateEmailVerificationCode();
    await user.save({ validateBeforeSave: false });

    const message = `
      <h1>Mã xác thực đăng ký</h1>
      <p>Mã xác thực của bạn là: <strong>${code}</strong></p>
      <p>Mã sẽ hết hạn sau 2 phút.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Xác minh email",
        message,
      });
    } catch (err) {
      console.error("Failed to send verification email", err);
    }

    const { password: userPassword, ...userInfo } = user._doc;

    return res.status(201).json({
      message:
        "Tài khoản đã được tạo. Vui lòng nhập mã xác thực gửi tới email để hoàn tất đăng ký.",
      user: userInfo,
      verificationRequired: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Missing email" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.emailVerified)
      return res.status(400).json({ message: "Email already verified" });

    const code = user.generateEmailVerificationCode();
    await user.save({ validateBeforeSave: false });

    const message = `<p>Mã xác thực mới của bạn là <strong>${code}</strong>. Mã sẽ hết hạn sau 2 phút.</p>`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Xác minh email - Mã mới",
        message,
      });
    } catch (e) {
      console.error(e);
    }

    return res.json({ message: "Mã xác thực đã được gửi lại" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "Missing email or code" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.emailVerified)
      return res.status(400).json({ message: "Email already verified" });

    const hashed = crypto.createHash("sha256").update(code).digest("hex");
    if (
      user.emailVerificationCode !== hashed ||
      !user.emailVerificationExpire ||
      user.emailVerificationExpire < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn" });
    }

    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // --- SỬA ĐỔI: Sử dụng sendTokenResponse cho Access/Refresh Token ---
    const { accessToken } = await sendTokenResponse(user, res);

    const { password: _p, ...userInfo } = user._doc;
    return res.json({ 
        message: "Xác thực thành công", 
        user: userInfo,
        accessToken // Trả về AccessToken
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
};

export const sendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Missing email" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const code = user.generateResetPasswordCode();
    await user.save({ validateBeforeSave: false });

    const message = `<h1>Mã đặt lại mật khẩu</h1><p>Mã của bạn là <strong>${code}</strong>.</p> <p>Mã sẽ hết hạn sau 15 phút.</p>`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Mã đặt lại mật khẩu",
        message,
      });
    } catch (e) {
      console.error(e);
    }

    return res.json({ message: "Mã đặt lại mật khẩu đã được gửi" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password)
      return res.status(400).json({ message: "Missing params" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = crypto.createHash("sha256").update(code).digest("hex");
    if (
      user.resetPasswordCode !== hashed ||
      !user.resetPasswordCodeExpire ||
      user.resetPasswordCodeExpire < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Mã không hợp lệ hoặc đã hết hạn" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordWithPepper = addPepper(password);
    user.password = await bcrypt.hash(passwordWithPepper, salt);
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpire = undefined;
    await user.save();

    // --- SỬA ĐỔI: Auto login sau khi reset pass với token mới ---
    const { accessToken } = await sendTokenResponse(user, res);

    return res.json({ 
        message: "Mật khẩu đã được cập nhật",
        accessToken 
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deleteUser = await User.findByIdAndDelete(id);

    if (!deleteUser) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    return res.json({
      messgae: "Người dùng được xóa thành công",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Not Enough Information",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Username wrong",
      });
    }

    // If account is banned, prevent login
    if (user.isBanned) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    const passwordWithPepper = addPepper(password);
    const match = await bcrypt.compare(passwordWithPepper, user.password);
    if (!match) {
      return res.status(401).json({
        message: "Password wrong",
      });
    }

    // --- SỬA ĐỔI: Logic login mới ---
    const { accessToken } = await sendTokenResponse(user, res);

    const { password: userPassword, refreshToken, ...userInfo } = user._doc;

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: userInfo,
      accessToken, // Trả về accessToken để Client lưu
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const loginGoogle = async (req, res) => {
  try {
    const { tokenGoogle } = req.body;

    // Kiểm tra nếu không có token
    if (!tokenGoogle) {
      return res.status(400).json({ message: "Missing Google token" });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokenGoogle,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const dataUser = ticket.getPayload();

    console.log("User verified:", dataUser);

    let user = await User.findOne({ email: dataUser.email });

    if (!user) {
      const randomPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const passwordWithPepper = addPepper(randomPassword);
      const hashedPassword = await bcrypt.hash(passwordWithPepper, 10);
      const generatedUsername = dataUser.email.split("@")[0];

      user = await User.create({
        username: generatedUsername,
        name: dataUser.name,
        email: dataUser.email,
        password: hashedPassword,
        phone: "Chưa cập nhật",
        role: "guest",
        emailVerified: true,
      });
    }

    // Prevent banned users logging in via Google
    if (user.isBanned) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    // --- SỬA ĐỔI: Logic login mới ---
    const { accessToken } = await sendTokenResponse(user, res);

    const { password: userPassword, refreshToken, ...userInfo } = user._doc;

    res
      .status(200)
      .json({ 
          success: true, 
          user: userInfo, 
          accessToken,
          message: "Login Google Success" 
      });
  } catch (error) {
    console.error("Error verifying Google token: ", error);
    res.status(401).json({ message: "Token không hợp lệ hoặc giả mạo" });
  }
};

// --- API MỚI: Cấp lại Access Token ---
export const refreshAccessToken = async (req, res) => {
    try {
      const incomingRefreshToken = req.cookies.refreshToken;
  
      if (!incomingRefreshToken) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập" });
      }
  
      const decoded = jwt.verify(
        incomingRefreshToken,
        process.env.JWT_REFRESH_SECRET
      );
  
      const user = await User.findById(decoded._id);
  
      if (!user || user.refreshToken !== incomingRefreshToken) {
        return res.status(403).json({ message: "Refresh Token không hợp lệ" });
      }
  
      const { accessToken } = await sendTokenResponse(user, res);
  
      return res.status(200).json({
        message: "Access token refreshed",
        accessToken,
        user: { // Trả về thông tin user để cập nhật state client nếu cần
            _id: user._id,
            name: user.name,
            role: user.role,
            username: user.username,
            phone: user.phone
        }
      });
  
    } catch (error) {
      console.log(error);
      return res.status(403).json({ message: "Invalid refresh token" });
    }
};

export const getUserInfor = async (req, res) => {
  try {
    const user_id = req.userId; // Middleware verifyToken đã xử lý việc check auth

    const user = await User.findById(user_id).select(
      "username name phone role createdAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User không tồn tại",
      });
    }

    res.json({
      message: "Thông tin người dùng mới nhất",
      user: user,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateUserInfo = async (req, res) => {
  try {
    const user_id = req.userId;

    const { name, phone } = req.body;
    if (!name && !phone) {
      return res.status(400).json({
        message: "Vui long cung cap thong tin can cap nhat",
      });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { $set: updateFields },
      { new: true }
    ).select("name phone role createdAt");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User không tồn tại",
      });
    }

    res.json({
      message: "Cập nhật thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const logoutUser = async (req, res) => {
    // 1. Xóa refresh token trong DB
    if (req.userId) { // req.userId có được nhờ middleware verifyToken
        await User.findByIdAndUpdate(req.userId, { $unset: { refreshToken: 1 } });
    }

    // 2. Xóa Cookie
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Chỉ true nếu chạy HTTPS
        sameSite: "strict" 
    });

    return res.status(200).json({ message: "Đã đăng xuất" });
};

export const toggleSaveListing = async (req, res) => {
  try {
    const userId = req.userId;

    const listingId = req.params.listingId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    const idx = user.savedListings
      ? user.savedListings.findIndex(
          (id) => id.toString() === listingId.toString()
        )
      : -1;
    if (idx === -1) {
      // add
      user.savedListings = user.savedListings || [];
      user.savedListings.push(listingId);
      await user.save();
      return res.json({ message: "Đã lưu bài viết" });
    } else {
      // remove
      user.savedListings.splice(idx, 1);
      await user.save();
      return res.json({ message: "Đã bỏ lưu bài viết" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Lấy danh sách tin đăng đã lưu của người dùng hiện tại
export const getSavedListings = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate({
      path: "savedListings",
      options: { sort: { createdAt: -1 } },
    });
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    return res.json({
      message: "Lấy danh sách đã lưu thành công",
      listings: user.savedListings || [],
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const currentUserId = req.userId;

    const query = req.query.q;
    if (!query) return res.json([]);

    const users = await User.find({
      username: { $regex: query, $options: "i" },
      _id: { $ne: currentUserId },
    }).select("username name role");

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};