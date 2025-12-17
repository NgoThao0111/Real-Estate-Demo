import Notification from "../models/notification.model.js";
import Announcement from "../models/announcement.model.js";
import AnnouncementRead from "../models/announcementRead.model.js";

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Lấy thông báo cá nhân (Của riêng tôi)
    const personalNotifs = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    // 2. Lấy thông báo toàn hệ thống (Còn hạn)
    const globalNotifs = await Announcement.find({
      $or: [
          { expiresAt: { $exists: false } }, // Không có hạn
          { expiresAt: { $gt: new Date() } } // Hoặc chưa hết hạn
      ],
      // Nếu user là 'user' thường thì không lấy cái của 'agent'
      targetAudience: { $in: ['all', req.userRole] } 
    }).sort({ createdAt: -1 }).limit(5);

    // 3. (Optional) Kiểm tra xem user đã đọc thông báo toàn hệ thống nào chưa
    // Lấy danh sách ID các thông báo global đã đọc
    const readGlobalIds = await AnnouncementRead.find({ userId })
      .select('announcementId')
      .distinct('announcementId'); // Trả về mảng [id1, id2...]

    // Map lại globalNotifs để thêm cờ isRead
    const mappedGlobal = globalNotifs.map(notif => ({
      _id: notif._id,
      title: notif.title,
      message: notif.message,
      type: 'SYSTEM_ANNOUNCEMENT', // Đánh dấu loại
      createdAt: notif.createdAt,
      isRead: readGlobalIds.some(id => id.toString() === notif._id.toString())
    }));

    // 4. Trộn 2 mảng lại và sắp xếp theo thời gian
    const allNotifications = [...personalNotifs, ...mappedGlobal].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.json({ notifications: allNotifications });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Đánh dấu đã đọc
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm thông báo cá nhân và update
    const notif = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.userId },
      { isRead: true },
      { new: true }
    );

    // Nếu không tìm thấy trong Notification, có thể đó là Announcement (xử lý sau)
    
    return res.json({ success: true, notification: notif });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Đánh dấu tất cả là đã đọc
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.userId, isRead: false },
            { isRead: true }
        );
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}