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

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken, verifyAdmin);

router.get("/stats", getStats);
router.get("/listings", getAllListings);
router.get("/stats/users-7days", getUserSignupsLast7Days);
router.get("/stats/properties-status", getPropertyStatusDistribution);
router.put("/listings/:id/status", updateListingStatus);

router.get("/users", getAllUsers);
router.put("/users/:id/ban", toggleBanUser);

router.post("/broadcast", broadcastSystemNotification);
router.get("/notifications", getNotifications);

export default router;
