import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"; 
import cookie from "cookie"; // Thư viện để parse cookie header của Socket
import User from "./models/user.model.js";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import listingRoutes from "./routes/list.route.js";
import propertyTypeRoutes from "./routes/property_type.route.js";
import chatRoutes from './routes/chat.route.js';
import reportRoutes from "./routes/report.route.js"
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

const __dirname = path.resolve

// --- 1. CẤU HÌNH SERVER ---

// Quan trọng khi deploy (Render, Vercel...): Tin tưởng proxy để cookie 'secure' hoạt động
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true
}));

const httpServer = createServer(app);

// Khởi tạo Socket.io với cấu hình CORS chuẩn
const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_ORIGIN,
        credentials: true, // Bắt buộc true để nhận Cookie JWT
        methods: ["GET", "POST"]
    }
});




app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser()); // Để Express đọc được cookie 'token'

// Middleware gắn 'io' vào req để Controller dùng (Gửi thông báo realtime)
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- 3. MIDDLEWARE XÁC THỰC SOCKET.IO (DÙNG JWT) ---
// Logic: Socket không đi qua express middleware, nên phải tự parse cookie và verify token
io.use((socket, next) => {
    try {
        // Lấy chuỗi cookie từ header
        const cookieHeader = socket.handshake.headers.cookie;
        
        if (!cookieHeader) {
            return next(new Error("Authentication error: No cookie found"));
        }

        // Parse cookie string thành object
        const cookies = cookie.parse(cookieHeader);
        const token = cookies.token; // Tên 'token' phải khớp với tên cookie bạn đặt lúc Login

        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        // Verify JWT Token
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return next(new Error("Authentication error: Invalid token"));
            }
            
            // Token hợp lệ -> Gán thông tin user vào socket
            // 'decoded' chính là payload bạn sign lúc login (thường chứa id, isAdmin...)
            socket.user = decoded; 
            next();
        });
    } catch (error) {
        console.error("Socket Auth Error:", error);
        next(new Error("Internal Server Error during Auth"));
    }
});

// --- 4. LOGIC SOCKET EVENTS (REAL-TIME) ---
io.on("connection", (socket) => {
    const user = socket.user; // Lấy từ middleware ở trên
    const userId = user._id || user.id;   // ID người dùng

    console.log(`User connected: ${userId}`);

    // --- CHAT EVENTS ---
    
    // Tham gia phòng chat (Conversation)
    socket.on("join_chat", (conversationId) => {
        socket.join(conversationId);
        // console.log(`User ${userId} joined room ${conversationId}`);
    });

    // Rời phòng chat
    socket.on("leave_chat", (conversationId) => {
        socket.leave(conversationId);
    });

    // Sự kiện: Đang gõ...
    socket.on("typing", (conversationId) => {
        // Gửi cho tất cả người trong phòng TRỪ người gửi
        socket.to(conversationId).emit("typing", { conversationId, userId });
    });

    socket.on("stop_typing", (conversationId) => {
        socket.to(conversationId).emit("stop_typing", { conversationId, userId });
    });

    // Sự kiện: Đã xem tin nhắn
    socket.on("mark_read", ({ conversationId, messageId }) => {
        socket.to(conversationId).emit("message_read", { 
            conversationId, 
            messageId, 
            readerId: userId 
        });
    });

    socket.on("disconnect", () => {
        // console.log("Socket disconnected:", socket.id);
    });
});

// --- 5. ROUTES API ---
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/property_type", propertyTypeRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('Server is up and running (JWT Mode)');
});

// API Kiểm tra trạng thái đăng nhập (Thay thế cho check-session cũ)
// Frontend gọi cái này để biết user còn đăng nhập hay không
// API Kiểm tra trạng thái đăng nhập
app.get('/api/check-auth', async (req, res) => { // Thêm async
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(200).json({ isAuthenticated: false, user: null });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => { // Thêm async
        if (err) {
            return res.status(200).json({ isAuthenticated: false, user: null });
        }
        
        try {
            // --- SỬA Ở ĐÂY: Thay vì trả về decoded, hãy tìm user trong DB ---
            // decoded.id là cái id mình đã lưu trong token
            const user = await User.findById(decoded._id || decoded.id).select("-password"); 
            
            if (!user) {
                return res.status(200).json({ isAuthenticated: false, user: null });
            }

            // Trả về full thông tin user (avatar, name...)
            return res.status(200).json({ 
                isAuthenticated: true, 
                user: user 
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json({ isAuthenticated: false, user: null });
        }
    });
});

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// --- 6. KHỞI CHẠY SERVER ---
httpServer.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});