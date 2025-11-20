import express from "express";
import { createPropertyType, deletePropertyType, getAllPropertyTypes, getPropertyTypeById, updatePropertyType } from "../controllers/property_type.controller.js";

const router = express.Router();

router.post("/createPropertyType", createPropertyType);
router.get("/getPropertyType", getAllPropertyTypes);
router.put("/updatePropertyType/:id", updatePropertyType);
router.delete("/deletePropertyType/:id", deletePropertyType);
router.get("/:id", getPropertyTypeById);

export default router;