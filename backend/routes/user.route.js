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
  changeAvatar
  // checkSession, // Hàm này có thể bỏ vì ta đã có /api/check-auth ở server.js
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js"; // <--- QUAN TRỌNG: Import middleware

const router = express.Router();

// --- 1. ROUTES CÔNG KHAI (Không cần đăng nhập) ---
router.post("/register", userRegister);
router.post("/login", loginUser);
router.post("/login-google", loginGoogle);
router.post("/logout", logoutUser); 
router.post('/resend-verification', resendVerification);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password-code', sendResetCode);
router.post('/reset-password-code', resetPasswordWithCode);

// --- 2. ROUTES BẢO MẬT (Cần đăng nhập) ---
// Áp dụng middleware verifyToken cho tất cả các route bên dưới
// Middleware này sẽ giải mã Token -> Lấy ID -> Gán vào req.userId
router.use(verifyToken); 

router.get("/profile", getUserInfor);
router.put("/me/update-profile", updateUserInfo);
router.delete("/deleteUser/:id", deleteUser); // Lưu ý: Thường chỉ Admin mới xóa được user
router.post("/save/:listingId", toggleSaveListing);
router.get("/saved", getSavedListings);
router.get("/search", searchUsers); // Cần userId để loại trừ bản thân khỏi kết quả tìm kiếm
router.put("/avatar", changeAvatar);

// router.get("/session", checkSession); // Route cũ, nên dùng /api/check-auth ở server.js thay thế

export default router;