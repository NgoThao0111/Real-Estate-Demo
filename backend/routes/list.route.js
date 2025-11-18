import express from "express"
import { createList, getListings, deleteListing, getMyListings, updateListing, getListingById } from "../controllers/listing.controller.js";

const router = express.Router();

router.post("/createList", createList);
router.get("/getList", getListings);
router.get(":id", getListingById);
router.delete("/delete/:id", deleteListing);
router.get("/my", getMyListings);
router.put("/:id", updateListing);

export default router;