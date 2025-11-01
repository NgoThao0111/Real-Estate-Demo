import express from "express"
import { createList } from "../controllers/listing.controller.js";
import { getListings, deleteListing } from "../controllers/listing.controller.js";

const router = express.Router();

router.post("/createList", createList);
router.get("/getList", getListings);
router.delete("/delete/:id", deleteListing);

export default router;