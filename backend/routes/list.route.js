import express from "express"
import { createList, getListings, deleteListing, getMyListings, updateListing, getListingById, searchListings } from "../controllers/listing.controller.js";

const router = express.Router();

router.post("/createList", createList);
router.get("/getList", getListings);
router.get("/search", searchListings);
router.get("/my", getMyListings);
router.delete("/delete/:id", deleteListing);
router.get("/:id", getListingById);
router.put("/:id", updateListing);


export default router;