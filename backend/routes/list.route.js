import express from "express";
import { createList, getListings, deleteListing, getMyListings, updateListing, getListingById } from "../controllers/listing.controller.js";
import {upload} from "../middleware/upload.js";

const router = express.Router();

router.post("/createList", createList);
router.get("/getList", getListings);
router.get("/my", getMyListings);
router.delete("/delete/:id", deleteListing);
router.get("/:id", getListingById);
router.put("/:id", updateListing);
router.post("/uploadImages", upload.array("images", 10), createList);

export default router;