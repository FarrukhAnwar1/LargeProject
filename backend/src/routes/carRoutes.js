import express from "express";
import {addCar, deleteCar, editCar, getCars, getCompanies} from "../controllers/carController.js";
import {verifyToken} from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, addCar);
router.delete("/:id",verifyToken, deleteCar)
router.patch("/:id", verifyToken, editCar);
router.get("/", verifyToken, getCars);
router.get("/companies", getCompanies);

export default router;
