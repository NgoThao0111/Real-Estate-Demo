import express from "express";
import { createReport } from "../controllers/report.controller.js";

const router = express.Router();

router.post("/createReport", createReport);

export default router;