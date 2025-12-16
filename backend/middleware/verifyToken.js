import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  // 1. Lấy token từ Header (Chuẩn: Authorization: Bearer <token>)
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Kiểm tra xem header có tồn tại và đúng định dạng "Bearer " không
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
        message: "Bạn chưa đăng nhập hoặc không có quyền truy cập!" 
    });
  }

  // Tách lấy phần token phía sau chữ "Bearer "
  const token = authHeader.split(" ")[1];

  // 2. Verify token bằng JWT_ACCESS_SECRET (Key ngắn hạn)
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      // --- QUAN TRỌNG: Phân biệt lỗi hết hạn để Frontend biết đường Refresh ---
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token Expired" }); 
      }
      
      return res.status(403).json({ message: "Token không hợp lệ!" });
    }

    // 3. Token ngon lành -> Gán thông tin user vào request
    req.userId = decoded._id; 
    req.userRole = decoded.role; // Gán thêm role để sau này check quyền Admin

    next();
  });
};