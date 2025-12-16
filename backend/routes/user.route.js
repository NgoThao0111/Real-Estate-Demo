import express from "express";
import {
  deleteUser,
  getUserInfor,
  loginUser,
  logoutUser,
  updateUserInfo,
  userRegister,
  resendVerification,
  verifyEmail,
  sendResetCode,
  resetPasswordWithCode,
  toggleSaveListing,
  getSavedListings,
  searchUsers,
  loginGoogle,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// ==========================================
// 1. ROUTES CÔNG KHAI (Public Routes)
// ==========================================

// Auth & Register
router.post("/register", userRegister);
router.post("/login", loginUser);
router.post("/login-google", loginGoogle);

// Refresh Token (QUAN TRỌNG: Phải để public để client gọi khi Access Token hết hạn)
router.post("/refresh-token", refreshAccessToken);

// Email Verification & Password Reset
router.post('/resend-verification', resendVerification);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password-code', sendResetCode);
router.post('/reset-password-code', resetPasswordWithCode);


// ==========================================
// 2. ROUTES BẢO MẬT (Protected Routes)
// ==========================================
// Tất cả các route bên dưới dòng này đều yêu cầu Access Token hợp lệ
router.use(verifyToken); 

// Logout (Chuyển xuống đây để middleware lấy được userId và xóa token trong DB)
router.post("/logout", logoutUser); 

// User Profile
router.get("/profile", getUserInfor);
router.put("/me/update-profile", updateUserInfo);

// Listings & Search
router.post("/save/:listingId", toggleSaveListing);
router.get("/saved", getSavedListings);
router.get("/search", searchUsers);

// Admin Action (Lưu ý: Nên có thêm middleware checkAdmin nếu cần bảo mật kỹ hơn)
router.delete("/deleteUser/:id", deleteUser);

export default router;