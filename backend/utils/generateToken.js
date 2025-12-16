import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, role) => {
  return jwt.sign({ _id: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};

// Hàm tiện ích để set cookie (Dùng khi login/register)
export const sendTokenResponse = async (user, res) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Lưu refresh token vào DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Chỉ lưu Refresh Token vào Cookie (HttpOnly) để an toàn
  // Access Token sẽ trả về dạng JSON để Client lưu trong Memory (biến JS)
  const cookieOptions = {
    httpOnly: true, // Client JS không đọc được (chống XSS)
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);

  return { accessToken, refreshToken };
};