import express from "express";
import {addCar, deleteCar,editCar, getCars} from "../controllers/carController.js";
import {verifyToken} from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, addCar);
router.delete("/:id",verifyToken, deleteCar)
router.patch("/:id", verifyToken, editCar);
router.get("/", verifyToken, getCars);


export default router;
