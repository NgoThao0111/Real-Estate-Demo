import express from "express";
import {
  deleteUser,
  getUserInfor,
  loginUser,
  logoutUser,
  updateUserInfo,
  userRegister,
  toggleSaveListing,
  getSavedListings,
  searchUsers,
  checkSession,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", getUserInfor);
router.get("/session", checkSession);
router.put("/me/update-profile", updateUserInfo);
router.delete("/deleteUser/:id", deleteUser);
router.post("/save/:listingId", toggleSaveListing);
router.get("/saved", getSavedListings);
router.get("/search", searchUsers);

export default router;
