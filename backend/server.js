import express from 'express';
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import listingRoutes from "./routes/list.route.js";
import propertyTypeRoutes from "./routes/property_type.route.js";
import chatRoutes from './routes/chat.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// 1. Tạo HTTP Server
const httpServer = createServer(app);

// 2. Cấu hình Session (Lưu vào MongoDB để cả Express và Socket cùng đọc được)
const sessionMiddleware = session({
    secret: process.env.SECRET_KEY || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI 
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : false, // 'lax' hoặc false cho dev
        httpOnly: true,
        maxAge: 1000 * 60 * 30 // Phiên đăng nhập 30p
    }
});

// 3. Khởi tạo Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_ORIGIN,
        credentials: true // Bắt buộc true để nhận cookie session
    }
});

// --- MIDDLEWARE CHO EXPRESS APP ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); 

// CORS setup
app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true
}));

// Kích hoạt Session cho Express
app.use(sessionMiddleware);

// Middleware gắn 'io' vào req để dùng trong Controller (Dùng cho tính năng Gửi tin nhắn)
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- MIDDLEWARE CHO SOCKET.IO (Bảo mật & Xác thực) ---

// Hàm helper: Chuyển middleware của Express sang Socket.io
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

// A. Cho phép Socket đọc session từ cookie
io.use(wrap(sessionMiddleware));

// B. Middleware xác thực: Chỉ cho phép User đã đăng nhập mới được kết nối Socket
io.use((socket, next) => {
    const session = socket.request.session;
    
    if (session && session.user) {
        socket.user = session.user; // Gán user vào socket để dùng bên dưới
        next();
    } else {
        console.log("Socket blocked: Unauthorized user");
        next(new Error("Unauthorized: Vui lòng đăng nhập"));
    }
});

// --- LOGIC SOCKET EVENTS (Xử lý Real-time) ---
io.on("connection", (socket) => {
    // Lấy thông tin user từ session đã gán ở trên
    const user = socket.user;
    const userId = user.id || user._id; 

    console.log(`User connected: ${user.username || user.name} (ID: ${userId})`);

    // 1. Quản lý Phòng chat (Join/Leave)
    socket.on("join_chat", (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${userId} joined room: ${conversationId}`);
    });

    socket.on("leave_chat", (conversationId) => {
        socket.leave(conversationId);
        console.log(`User ${userId} left room: ${conversationId}`);
    });

    // 2. Tính năng: Đang gõ... (Typing)
    // Logic: Gửi cho tất cả mọi người trong phòng TRỪ người gửi (socket.to)
    socket.on("typing", (conversationId) => {
        socket.to(conversationId).emit("typing", { conversationId, userId, username: user.username });
    });

    socket.on("stop_typing", (conversationId) => {
        socket.to(conversationId).emit("stop_typing", { conversationId, userId });
    });

    // 3. Tính năng: Đã xem (Read Receipt) - Tích hợp ý tưởng của bạn bạn
    socket.on("mark_read", ({ conversationId, messageId }) => {
        // Gửi sự kiện cho người bên kia biết mình đã đọc
        socket.to(conversationId).emit("message_read", { conversationId, messageId, readerId: userId });
        
        // Lưu ý: Việc update DB "đã đọc" nên gọi qua API (PUT /api/chats/:id/read) 
        // hoặc thực hiện trực tiếp tại đây nếu muốn tối ưu tốc độ.
    });

    // Xử lý ngắt kết nối
    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

// --- ROUTES API ---
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/property_type", propertyTypeRoutes);
app.use('/api/chats', chatRoutes);

app.get('/', (req, res) => {
    res.send('Server is up and running');
});

app.get('/api/check-session', (req, res) => {
    if (req.session.user) {
        // In ra thời gian còn lại của cookie
        console.log("Cookie expires in:", req.session.cookie.maxAge / 1000, "seconds");
        return res.json({ status: 'Live', user: req.session.user });
    }
    return res.status(401).json({ status: 'Expired' });
});

// --- KHỞI CHẠY SERVER ---
// Quan trọng: Phải dùng httpServer.listen
httpServer.listen(PORT, () => {
    connectDB();
    console.log(`Server (HTTP + Socket) is running on port ${PORT}`);
});