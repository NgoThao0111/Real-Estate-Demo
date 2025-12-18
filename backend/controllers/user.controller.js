import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Import jwt
import dotenv from "dotenv";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";
// import sendEmail from "../utils/sendEmail.js";
// import { Resend } from "resend";
import crypto from "crypto";
import { jwtDecode } from "jwt-decode";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

import nodemailer from "nodemailer";

// --- CẤU HÌNH BREVO SMTP ---
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_LOGIN, // Email đăng nhập Brevo
    pass: process.env.BREVO_PASS, // Master Password (SMTP Key) của Brevo
  },
});

// --- THÊM ĐOẠN NÀY ĐỂ TEST KẾT NỐI NGAY KHI SERVER CHẠY ---
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ LỖI KẾT NỐI SMTP BREVO:");
    console.error(error);
  } else {
    console.log("✅ KẾT NỐI SMTP BREVO THÀNH CÔNG! Sẵn sàng gửi mail.");
  }
});

// Giữ nguyên tên hàm để không ảnh hưởng code cũ
const sendEmailViaResend = async (toEmail, subject, htmlContent) => {
  try {
    // Với Brevo, 'from' bắt buộc phải là email bạn đã verify trong tài khoản Brevo
    // (Thường chính là email đăng nhập BREVO_USER)
    const senderEmail = process.env.BREVO_USER;

    const info = await transporter.sendMail({
      from: `"Support Team" <${senderEmail}>`, // Thêm tên hiển thị cho chuyên nghiệp
      to: toEmail, // QUAN TRỌNG: Dùng biến toEmail, không được hardcode email của bạn vào đây
      subject: subject,
      html: htmlContent,
    });

    console.log(
      `Email sent via Brevo to ${toEmail}. Message ID: ${info.messageId}`
    );
    return info;
  } catch (error) {
    console.error("Error sending email via Brevo:", error);
    // Không throw error để tránh crash app, chỉ log lại lỗi
    return null;
  }
};

// const sendEmailViaResend = async (toEmail, subject, htmlContent) => {
//   try {
//     // LƯU Ý QUAN TRỌNG:
//     // 1. Nếu chưa add domain riêng: Bắt buộc dùng 'onboarding@resend.dev' và chỉ gửi được cho chính email đăng ký Resend của bạn.
//     // 2. Nếu đã verify domain (vd: verified@my-app.com): Thay dòng 'from' bên dưới thành email domain của bạn.
//     const senderEmail = process.env.EMAIL_SENDER || "onboarding@resend.dev";

//     const data = await resend.emails.send({
//       from: senderEmail,
//       to: "hoangvanbinh14122005@gmail.com",
//       subject: subject,
//       html: htmlContent,
//     });

//     console.log(`Email sent to ${toEmail}. ID: ${data.id}`);
//     return data;
//   } catch (error) {
//     console.error("Resend Error:", error);
//     // Không throw error để tránh crash app nếu gửi mail lỗi, chỉ log lại
//     return null;
//   }
// };

const pepperPassword = (password) => {
  if (!process.env.PASSWORD_PEPPER) {
    throw new Error("Chưa cấu hình PASSWORD_PEPPER trong file .env");
  }

  // Dùng HMAC-SHA256 để trộn password và pepper
  // Kết quả trả về là chuỗi hex 64 ký tự (vừa vặn giới hạn 72 bytes của Bcrypt)
  return crypto
    .createHmac("sha256", process.env.PASSWORD_PEPPER)
    .update(password)
    .digest("hex");
};

export const userRegister = async (req, res) => {
  try {
    const { password, name, phone, role, email } = req.body;

    // 1. Kiểm tra Email
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Thiếu email" });
    }

    // Regex đơn giản để check format email (có @ và dấu chấm)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    // 2. Kiểm tra Password
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    // 3. Kiểm tra Tên
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Thiếu tên người dùng" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "Gmail đang dùng đã tồn tại",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordWithPepper = pepperPassword(password);
    const hashedPassword = await bcrypt.hash(passwordWithPepper, salt);

    const username = email.split("@")[0];

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

    // const message = `
    //   <h1>Mã xác thực đăng ký</h1>
    //   <p>Mã xác thực của bạn là: <strong>${code}</strong></p>
    //   <p>Mã sẽ hết hạn sau 2 phút.</p>
    // `;

    // --- GỬI MAIL BẰNG RESEND ---
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Xác thực đăng ký</h2>
        <p>Mã xác thực của bạn là:</p>
        <h1 style="color: #007bff; letter-spacing: 5px;">${code}</h1>
        <p>Mã sẽ hết hạn sau 2 phút.</p>
      </div>
    `;

    // Gửi mail (Await ở đây vẫn nhanh vì Resend là API, tốn khoảng 200-500ms)
    await sendEmailViaResend(user.email, "Xác minh email", htmlMessage);

    // try {
    //   await sendEmail({
    //     email: user.email,
    //     subject: "Xác minh email",
    //     message,
    //   });
    // } catch (err) {
    //   console.error("Failed to send verification email", err);
    // }

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

    // const message = `<p>Mã xác thực mới của bạn là <strong>${code}</strong>. Mã sẽ hết hạn sau 2 phút.</p>`;
    // try {
    //   await sendEmail({
    //     email: user.email,
    //     subject: "Xác minh email - Mã mới",
    //     message,
    //   });
    // } catch (e) {
    //   console.error(e);
    // }

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif;">
         <p>Mã xác thực mới của bạn là: <strong style="font-size: 18px; color: #007bff;">${code}</strong></p>
         <p>Mã sẽ hết hạn sau 2 phút.</p>
      </div>
    `;

    await sendEmailViaResend(
      user.email,
      "Xác minh email - Mã mới",
      htmlMessage
    );

    return res.json({ message: "Mã xác thực đã được gửi lại" });
  } catch (error) {
    console.error(error);
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

    // Auto login after verification
    generateTokenAndSetCookie(res, user._id, user.role);

    const { password: _p, ...userInfo } = user._doc;
    return res.json({ message: "Xác thực thành công", user: userInfo });
  } catch (error) {
    console.error(error);
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

    // const message = `<h1>Mã đặt lại mật khẩu</h1><p>Mã của bạn là <strong>${code}</strong>.</p> <p>Mã sẽ hết hạn sau 15 phút.</p>`;
    // try {
    //   await sendEmail({
    //     email: user.email,
    //     subject: "Mã đặt lại mật khẩu",
    //     message,
    //   });
    // } catch (e) {
    //   console.error(e);
    // }

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif;">
        <h1>Mã đặt lại mật khẩu</h1>
        <p>Mã của bạn là <strong style="font-size: 18px; color: #d9534f;">${code}</strong>.</p> 
        <p>Mã sẽ hết hạn sau 15 phút.</p>
      </div>
    `;

    await sendEmailViaResend(user.email, "Mã đặt lại mật khẩu", htmlMessage);

    return res.json({ message: "Mã đặt lại mật khẩu đã được gửi" });
  } catch (error) {
    console.error(error);
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
    const passwordWithPepper = pepperPassword(password);
    user.password = await bcrypt.hash(passwordWithPepper, salt);
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpire = undefined;
    await user.save();

    // Auto login after password reset
    generateTokenAndSetCookie(res, user._id, user.role);

    return res.json({ message: "Mật khẩu đã được cập nhật" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Not Enough Information",
      });
    }

    const user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    });

    if (!user) {
      return res.status(401).json({
        message: "Email incorrect",
      });
    }

    // If account is banned, prevent login
    if (user.isBanned) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    const passwordWithPepper = pepperPassword(password);

    const match = await bcrypt.compare(passwordWithPepper, user.password);
    if (!match) {
      return res.status(401).json({
        message: "Password wrong",
      });
    }

    generateTokenAndSetCookie(res, user._id, user.role);

    const { password: userPassword, ...userInfo } = user._doc;

    return res.status(200).json({
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
        emailVerified: true,
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
    
    const user_id = req.userId; 

    const user = await User.findById(user_id).select(
      "username name phone email role createdAt"
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

export const checkSession = (req, res) => {
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
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    })
    .status(200)
    .json({ message: "Đã đăng xuất" });
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
