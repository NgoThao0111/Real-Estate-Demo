import express from "express"
import { deleteUser, getSession, getUserInfor, loginUser, logoutUser, updateUserInfo, userRegister, toggleSaveListing, getSavedListings } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", getUserInfor);
router.get("/session", getSession);
router.put("/me/update-profile", updateUserInfo);
router.delete("/deleteUser/:id", deleteUser);
router.post('/save/:listingId', toggleSaveListing);
router.get('/saved', getSavedListings);


export default router;