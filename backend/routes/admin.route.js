import express from "express";
import {
  getStats,
  getAllListings,
  updateListingStatus,
  getUserSignupsLast7Days,
  getPropertyStatusDistribution,
  getAllUsers,
  toggleBanUser,
  broadcastSystemNotification,
  getNotifications,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import { adminLimiter } from "../middleware/rateLimiter.js";
import { validateBroadcast, validateStatusUpdate, validateToggleBan } from "../middleware/adminValidation.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken, verifyAdmin, adminLimiter);

router.get("/stats", getStats);
router.get("/listings", getAllListings);
router.get("/stats/users-7days", getUserSignupsLast7Days);
router.get("/stats/properties-status", getPropertyStatusDistribution);
router.put("/listings/:id/status", validateStatusUpdate, updateListingStatus);

router.get("/users", getAllUsers);
router.put("/users/:id/ban", validateToggleBan, toggleBanUser);

router.post("/broadcast", validateBroadcast, broadcastSystemNotification);
router.get("/notifications", getNotifications);

export default router;
