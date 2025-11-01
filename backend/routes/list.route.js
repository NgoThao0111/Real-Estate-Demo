import express from "express"
import { createList } from "../controllers/listing.controller.js";
import { getListings } from "../controllers/listing.controller.js";

const router = express.Router();

router.post("/createList", createList);
router.get("/getList", getListings);

export default router;