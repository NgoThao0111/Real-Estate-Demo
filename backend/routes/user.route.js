import express from "express"
import { deleteUser, getUserInfor, loginUser, updateUserInfo, userRegister } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", loginUser);
router.get("/me", getUserInfor);
router.put("/me/update-profile", updateUserInfo);
router.delete("/deleteUser/:id", deleteUser);


export default router;