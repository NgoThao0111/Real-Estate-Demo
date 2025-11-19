import express from "express";
import { createPropertyType, deletePropertyType, getAllPropertyTypes, updatePropertyType } from "../controllers/property_type.controller.js";

const router = express.Router();

router.post("/createPropertyType", createPropertyType);
router.get("/getPropertyType", getAllPropertyTypes);
router.put("/updatePropertyType/:id", updatePropertyType);
router.delete("/deletePropertyType/:id", deletePropertyType);

export default router;