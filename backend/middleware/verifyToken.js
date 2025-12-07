import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Chưa đăng nhập!" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ!" });
    
    // Gán userId vào req để các controller phía sau dùng
    req.userId = payload._id || payload.id; 
    
    next();
  });
};