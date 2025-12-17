import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "POST_APPROVED",
        "POST_REJECTED",
        "POST_DELETED",
        "USER_BANNED",
        "REPORT_RESOLVED",
      ],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId
    },
    referenceModel: {
      type: String,
      enum: ['List', 'Report', 'User'],
    },
    title: {
      type: String,
      required: true
    },
    message: { type: String },
    reason: {
      type: String,
      default: "",
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export const markAnnouncementAsRead = async (req, res) => {
    try {
        const { id } = req.params; // ID của Announcement
        const userId = req.userId;

        await AnnouncementRead.create({
            userId,
            announcementId: id
        });

        return res.json({ success: true });
    } catch (e) {
        // Nếu duplicate key (đã đọc rồi) thì thôi, ko báo lỗi
        return res.json({ success: true });
    }
}

export default Notification;
