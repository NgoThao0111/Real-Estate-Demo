import mongoose from "mongoose";

const announcementReadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  announcementId: { type: mongoose.Schema.Types.ObjectId, required: true },
  readAt: { type: Date, default: Date.now }
});
// Đảm bảo 1 user chỉ có 1 record read cho 1 thông báo
announcementReadSchema.index({ userId: 1, announcementId: 1 }, { unique: true });

const AnnouncementRead = mongoose.model("AnnouncementRead", announcementReadSchema);
export default AnnouncementRead;