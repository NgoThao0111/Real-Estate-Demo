import express from "express"
import { deleteUser, userRegister } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", userRegister);
router.delete("/deleteUser/:id", deleteUser);

export default router;