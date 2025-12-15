import mongoose from "mongoose";

const systemNotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "alert"], default: "info" },
    audience: { type: String, enum: ["all", "admins", "users"], default: "all" },
  },
  { timestamps: true }
);

const SystemNotification = mongoose.model("SystemNotification", systemNotificationSchema);

export default SystemNotification;
