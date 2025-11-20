import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

const requireAuth = (req, res) => {
  if (!req.session || !req.session.user)
    return res.status(401).json({ message: "Vui lòng đăng nhập" });
  return req.session.user;
};

//POST /api/chats
export const createConversation = async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const { participantIds = [], title, type = "private" } = req.body;
    const participants = Array.from(new Set([user.id, ...participantIds]));

    const conv = await Conversation.create({
      title: title || null,
      participants,
      type,
    });

    await conv.populate("participants", "username name");

    return res.status(201).json({
      message: "Created",
      conversation: conv,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

//GET /api/chats -> list conversations for current user
export const getConversations = async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const { page = 1, limit = 20 } = req.query;
    const skip = (Math.max(1, page) - 1) * limit;

    const convs = await Conversation.find({ participants: user.id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("participants", "username name")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username name" },
      });

    return res.json({
      messsage: "OK",
      conversations: convs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

//GET /api/chats/:id/message?page=&limit=&before= (cursor)
export const getMessages = async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const convId = req.params.id;
    const { page = 1, limit = 30, before } = req.query;
    const skip = (Math.max(1, page) - 1) * limit;
    const query = { conversation: convId };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("sender", "username name");

    return res.json({
      message: "OK",
      messages
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

//PUT /api/chats/:id/read body: { messageIds: [...] } -> mark read bt current user
export const markMessagesRead = async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const convId = req.params.id;
    const { messageIds } = req.body;
    const filter = { conversation: convId };
    if (Array.isArray(messageIds) && messageIds.length)
      filter._id = { $in: messageIds };

    await Message.updateMany(filter, { $addToSet: { readBy: user.id } });

    const updated = (await Message.find(filter).where('readBy')).includes([user.id]);
    return res.json({
        message: 'Marked read',
        updatedCount: updated.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
        message: 'Server error'
    });
  }
};

//POST /api/chats/:id/participants -> add participants
export const addParticipant = async (req, res) => {
    try {
        const user = requireAuth(req, res);
        if(!user) return;

        const convId = req.params.id;
        const { participantId } = req.body;
        const conv = await Conversation.findById(convId);
        if(!conv) return res.status(404).json({
            message: 'Conversation not found'
        });

        if(!conv.participants.includes(user.id)) return res.status(403).json({ message: 'Forbidden' });

        conv.participants = conv.participants.includes(participantId) ? conv.participants : conv.participants.concat([participantId]);
        await conv.save();
        await conv.populate('participant', 'username name');

        return res.json({
            message: 'Participant added',
            conversation: conv
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Server error'
        });        
    }
};

export const sendMessage = async (req, res) => {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const convId = req.params.id;
    const { content, type = "text" } = req.body;

    // 1. Tạo tin nhắn mới
    const newMessage = await Message.create({
      conversation: convId,
      sender: user.id,
      content,
      type,
      readBy: [user.id] // Người gửi đương nhiên đã đọc
    });

    // 2. Populate để lấy thông tin sender (avatar, name) trả về cho client
    await newMessage.populate("sender", "username name");

    // 3. Cập nhật lastMessage cho Conversation (để sort list chat)
    await Conversation.findByIdAndUpdate(convId, {
      lastMessage: newMessage._id,
      updatedAt: new Date() // Quan trọng để conversation nhảy lên đầu list
    });

    // 4. REAL-TIME MAGIC: Gửi sự kiện socket cho tất cả user đang xem hội thoại này
    // 'req.io' có được nhờ middleware ở server.js
    req.io.to(convId).emit("new_message", newMessage);

    return res.status(201).json({
      message: "Sent",
      data: newMessage
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
