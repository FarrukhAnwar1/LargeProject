import express from "express";
import {addRental, deleteRental, editRental, getRentalsByCar} from "../controllers/rentalController.js";
import {verifyToken} from "../utils/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.post("/", addRental);
router.put("/:id", editRental);
router.delete("/:id", deleteRental);
router.get("/:carID", getRentalsByCar);


export default router;