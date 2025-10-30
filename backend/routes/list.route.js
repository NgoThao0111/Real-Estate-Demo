import express from "express"
import { createList } from "../controllers/listing.controller.js";

const router = express.Router();

router.post("/createList", createList);

export default router;