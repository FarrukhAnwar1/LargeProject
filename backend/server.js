import dotenv from "dotenv";
dotenv.config();  

import express from "express";
import authRoutes from "./src/routes/auth-route.js";
import carRoutes from "./src/routes/carRoutes.js";
import rentalRoutes from"./src/routes/rentalRoutes.js";
import { connectDB } from "./src/config/db.js";

connectDB();

const app = express();
app.use(express.json());

// Handle CORS properly
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/car", carRoutes);
app.use("/api/rental", rentalRoutes);

app.get("/test", (req, res) => {
  res.json({ message: "Server is running" });
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log("Server started on PORT:", port);
});
