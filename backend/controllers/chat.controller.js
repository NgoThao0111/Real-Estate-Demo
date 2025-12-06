import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

// Helper: Kiểm tra Auth và trả về null nếu thất bại để chặn luồng code
const requireAuth = (req, res) => {
  if (!req.session || !req.session.user) {
    res.status(401).json({ message: "Vui lòng đăng nhập" });
    return null; // Trả về null để hàm gọi biết là failed
  }
  return req.session.user;
};

// POST /api/chats
export const createConversation = async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return; // Dừng lại nếu requireAuth trả về null

    const { participantIds = [], title, type = "private" } = req.body;
    
    // Đảm bảo không trùng lặp ID và ép kiểu về String để so sánh chuẩn
    const uniqueIds = new Set([user._id, ...participantIds]);
    const participants = Array.from(uniqueIds);

    // Kiểm tra xem đã có conversation giữa các participants này chưa
    if (type === "private" && participants.length === 2) {
      const existingConv = await Conversation.findOne({
        type: "private",
        participants: { $all: participants, $size: 2 }
      }).populate("participants", "username name profile");

      if (existingConv) {
        return res.json({
          message: "Found existing conversation",
          conversation: existingConv,
        });
      }
    }

    const conv = await Conversation.create({
      title: title || null,
      participants,
      type,
    });

    await conv.populate("participants", "username name profile");

    return res.status(201).json({
      message: "Created",
      conversation: conv,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/chats -> list conversations for current user
export const getConversations = async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const { page = 1, limit = 20 } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const convs = await Conversation.find({ participants: user._id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("participants", "username name profile")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username name profile" },
      });

    return res.json({
      message: "OK", // Đã sửa lỗi chính tả messsage
      conversations: convs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/chats/:id/message
export const getMessages = async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const convId = req.params.id;
    const { page = 1, limit = 30, before } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const query = { conversation: convId };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("sender", "username name profile"); // Thêm profile nếu cần hiển thị avatar

    return res.json({
      message: "OK",
      messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/chats/:id/read
export const markMessagesRead = async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const convId = req.params.id;
    const { messageIds } = req.body;
    const filter = { conversation: convId };
    
    // Nếu có danh sách ID cụ thể thì lọc, không thì đánh dấu tất cả trong chat này
    if (Array.isArray(messageIds) && messageIds.length) {
      filter._id = { $in: messageIds };
    }
    
    // Chỉ update những tin chưa được user này đọc để tối ưu hiệu năng
    filter.readBy = { $ne: user._id };

    const result = await Message.updateMany(filter, { 
      $addToSet: { readBy: user._id } 
    });

    return res.json({
      message: "Marked read",
      updatedCount: result.modifiedCount, // Sử dụng kết quả trả về từ MongoDB
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/chats/:id/participants
export const addParticipant = async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const convId = req.params.id;
    const { participantId } = req.body;

    const conv = await Conversation.findById(convId);
    if (!conv) {
        return res.status(404).json({ message: "Conversation not found" });
    }

    // Convert ObjectId sang String để so sánh chính xác
    const isMember = conv.participants.some(id => id.toString() === user.id.toString());
    if (!isMember) {
        return res.status(403).json({ message: "Forbidden" });
    }

    // Check xem người mới đã có trong nhóm chưa
    const isAlreadyAdded = conv.participants.some(id => id.toString() === participantId.toString());
    
    if (!isAlreadyAdded) {
      conv.participants.push(participantId);
      await conv.save();
    }

    // Sửa lỗi chính tả: 'participant' -> 'participants'
    await conv.populate("participants", "username name profile");

    return res.json({
      message: "Participant added",
      conversation: conv,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/chats/:id/messages
export const sendMessage = async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const convId = req.params.id;
    const { content, type = "text" } = req.body;

    // 1. Tạo tin nhắn mới
    const newMessage = await Message.create({
      conversation: convId,
      sender: user._id,
      content,
      type,
      readBy: [user._id],
    });

    // 2. Populate thông tin người gửi
    await newMessage.populate("sender", "username name profile");

    // 3. Cập nhật lastMessage và updatedAt cho Conversation
    await Conversation.findByIdAndUpdate(convId, {
      lastMessage: newMessage._id,
      updatedAt: new Date(),
    });

    // 4. Real-time Socket
    if (req.io) {
      req.io.to(convId).emit("new_message", newMessage);
    } else {
        console.warn("Socket.io (req.io) is undefined. Realtime update skipped.");
    }

    return res.status(201).json({
      message: "Sent",
      data: newMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};