import rateLimit from "express-rate-limit";

export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Rate limiter for public search endpoint to avoid abusive polling
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // allow up to 15 searches per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many search requests, please try again later." },
});
