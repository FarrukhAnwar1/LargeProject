import express from "express";
import { signup,  login, logout, verifyEmail, forgotPassword, resetPassword} from "../controllers/auth-controller.js";

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
