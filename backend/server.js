import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import https from "https"; // Import https
import fs from "fs"; // Import fs
import { URL } from "url"; // Import URL
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "./models/user.model.js";
import { connectDB } from "./config/db.js";

// Import Routes
import userRoutes from "./routes/user.route.js";
import listingRoutes from "./routes/list.route.js";
import propertyTypeRoutes from "./routes/property_type.route.js";
import chatRoutes from "./routes/chat.route.js";
import reportRoutes from "./routes/report.route.js";
import adminRoutes from "./routes/admin.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. CẤU HÌNH CORS  ---
// Danh sách các nguồn được phép truy cập
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN, // Giá trị từ .env (VD: https://localhost:5173)
  "http://localhost:5173", // Vite Local
  "http://localhost:3000", // Next.js Local
  "http://localhost", // Nginx / Docker (Port 80)
  "http://127.0.0.1", // Loopback IP
  "https://localhost:5173", // HTTPS Local
];

const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép các request không có origin (như Postman, Server-to-Server, Mobile App)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      origin === process.env.FRONTEND_ORIGIN
    ) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Bắt buộc để nhận Cookie
};

app.use(cors(corsOptions));

// --- 2. CẤU HÌNH PROXY ---
app.set("trust proxy", 1);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// --- 3. KHỞI TẠO SERVER (HTTP vs HTTPS) ---
let server;

// Kiểm tra biến môi trường để biết có đang chạy trong Docker không
const isDocker = process.env.DOCKER_ENV === "true";
const isProduction = process.env.NODE_ENV === "production";

if (isProduction || isDocker) {
  console.log(
    `Running in ${isDocker ? "Docker" : "Production"} mode (HTTP Only)`
  );
  server = http.createServer(app);
} else {
  console.log("Running in Local Development mode (HTTPS)");
  try {
    const options = {
      key: fs.readFileSync(new URL("./localhost-key.pem", import.meta.url)),
      cert: fs.readFileSync(new URL("./localhost.pem", import.meta.url)),
    };
    server = https.createServer(options, app);
  } catch (error) {
    console.error("CẢNH BÁO: Không tìm thấy chứng chỉ SSL (localhost.pem).");
    console.error("Đang chuyển về chế độ HTTP thường.");
    server = http.createServer(app);
  }
}

// --- 4. SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- 5. SOCKET AUTHENTICATION MIDDLEWARE ---
io.use((socket, next) => {
  try {
    let token = socket.handshake.auth.token;

    if (!token)
      return next(new Error("Authentication error: No token provided"));

    // Nếu token có prefix "Bearer ", cắt bỏ nó
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, async (err, decoded) => {
      if (err) return next(new Error("Authentication error: Invalid token"));
      // Check if user exists and is not banned
      try {
        const user = await User.findById(decoded._id || decoded.id).select(
          "isBanned role name"
        );
        if (!user)
          return next(new Error("Authentication error: User not found"));
        if (user.isBanned)
          return next(new Error("Authentication error: User banned"));
        socket.user = decoded;
        next();
      } catch (e) {
        console.error("Socket auth DB error", e);
        return next(new Error("Internal Server Error during Auth"));
      }
    });
  } catch (error) {
    console.error("Socket Auth Error:", error);
    next(new Error("Internal Server Error during Auth"));
  }
});

// --- 6. SOCKET EVENTS ---
io.on("connection", (socket) => {
  const user = socket.user;
  const userId = user._id || user.id;
  // Join a room for this specific user to allow targeted messages (e.g., force logout)
  try {
    socket.join(`user_${userId}`);
  } catch (e) {
    console.error("Failed to join user room", e);
  }
  // console.log(`User connected: ${userId}`);

  socket.on("join_chat", (conversationId) => {
    socket.join(conversationId);
  });
  socket.on("leave_chat", (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on("typing", (conversationId) => {
    socket.to(conversationId).emit("typing", { conversationId, userId });
  });

  socket.on("stop_typing", (conversationId) => {
    socket.to(conversationId).emit("stop_typing", { conversationId, userId });
  });

  socket.on("mark_read", ({ conversationId, messageId }) => {
    socket.to(conversationId).emit("message_read", {
      conversationId,
      messageId,
      readerId: userId,
    });
  });

  // Admin Broadcast
  socket.on("admin_broadcast", async (payload) => {
    try {
      if (!socket.user || socket.user.role !== "admin") return;
      // Dynamic import model
      const SystemNotification = (
        await import("./models/systemNotification.model.js")
      ).default;
      const { title, message, type = "info", audience = "all" } = payload || {};
      if (!title || !message) return;

      const notif = await SystemNotification.create({
        title,
        message,
        type,
        audience,
      });
      io.emit("system_notification", {
        id: notif._id,
        title,
        message,
        type,
        audience,
        createdAt: notif.createdAt,
      });
    } catch (err) {
      console.error("admin_broadcast error", err);
    }
  });

  socket.on("disconnect", () => {
    // console.log("Socket disconnected:", socket.id);
  });
});

// --- 7. ROUTES ---
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/property_type", propertyTypeRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Server is running correctly with Docker/CORS Fixes.");
});

// API Check Auth
app.get("/api/check-auth", async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(200).json({ isAuthenticated: false, user: null });
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) {
      res.clearCookie("refreshToken");
      return res.status(200).json({ isAuthenticated: false, user: null });
    }

    try {
      const user = await User.findById(decoded._id).select("-password");

      // Kiểm tra token trong DB có khớp không (Security check)
      if (!user || user.isBanned || user.refreshToken !== token) {
        res.clearCookie("refreshToken");
        return res.status(200).json({ isAuthenticated: false, user: null });
      }

      return res.status(200).json({ isAuthenticated: true, user: user });
    } catch (error) {
      console.log(error);
      return res.status(200).json({ isAuthenticated: false, user: null });
    }
  });
});

// --- 8. START SERVER ---
server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
