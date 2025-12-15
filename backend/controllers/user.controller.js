import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Import jwt
import dotenv from "dotenv";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";
import { jwtDecode } from "jwt-decode";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const userRegister = async (req, res) => {
  try {
    const { username, password, name, phone, role } = req.body;

    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        message: "Tên người dùng đã tồn tại",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username: username,
      password: hashedPassword,
      name: name,
      phone: phone,
      role: role || "guest",
    });

    await user.save();

    generateTokenAndSetCookie(res, user._id, user.role);

    // Gửi cookie chứa token
    const { password: userPassword, ...userInfo } = user._doc;

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: userInfo,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const deleteUser = async (req, res) => {
  // ... (Giữ nguyên logic xóa user, nhưng lưu ý quyền admin nếu cần)
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

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        message: "Password wrong",
      });
    }

    generateTokenAndSetCookie(res, user._id, user.role);

    const { password: userPassword, ...userInfo } = user._doc;

    return res.status(201).json({
      message: "Đăng nhập thành công",
      user: userInfo,
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

    //Verify thành công -> lấy data user từ payload
    const dataUser = ticket.getPayload();

    console.log("User verified:", dataUser);

    // 3. Xử lý logic lưu user vào DB hoặc tạo JWT của hệ thống bạn ở đây...
    // ...

    let user = await User.findOne({ email: dataUser.email });

    if (!user) {
      const randomPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const generatedUsername = dataUser.email.split("@")[0];

      user = await User.create({
        username: generatedUsername,
        name: dataUser.name,
        email: dataUser.email,
        password: hashedPassword,
        phone: "Chưa cập nhật",
        role: "guest",
      });
    }

    // Prevent banned users logging in via Google
    if (user.isBanned) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    generateTokenAndSetCookie(res, user._id, user.role);

    const { password: userPassword, ...userInfo } = user._doc;

    res
      .status(200)
      .json({ success: true, user: userInfo, message: "Login Google Success" });
  } catch (error) {
    console.error("Error verifying Google token: ", error);
    res.status(401).json({ message: "Token không hợp lệ hoặc giả mạo" });
  }
};

export const getUserInfor = async (req, res) => {
  try {
    // --- JWT: Lấy userId từ middleware verifyToken (đã gán vào req.userId) ---
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
    // --- JWT: Lấy userId từ req.userId ---
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

// Hàm này không cần thiết với JWT vì client có thể tự check token hoặc gọi api/check-auth
// Tuy nhiên nếu muốn giữ lại logic cũ thì sửa như sau:
export const checkSession = (req, res) => {
  // Logic này thực tế đã được chuyển sang middleware hoặc endpoint /api/check-auth trong server.js
  // Bạn có thể xóa hàm này hoặc giữ lại dưới dạng check token đơn giản
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ message: "No active session", user: null });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err)
      return res.status(401).json({ message: "Invalid Token", user: null });

    const user = await User.findById(payload._id).select("-password");
    return res.status(200).json({
      message: "Session active",
      user: user,
    });
  });
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Đã đăng xuất" });
};

export const toggleSaveListing = async (req, res) => {
  try {
    // --- JWT: Lấy userId từ req.userId ---
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
    console.log(req.userId); // --- JWT: Lấy userId từ req.userId ---
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
    // --- JWT: Lấy userId từ req.userId ---
    // Lưu ý: searchUsers cần được bảo vệ bởi middleware verifyToken để có req.userId
    const currentUserId = req.userId;

    const query = req.query.q;
    if (!query) return res.json([]);

    // Tìm user theo tên, trừ bản thân mình ra
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
