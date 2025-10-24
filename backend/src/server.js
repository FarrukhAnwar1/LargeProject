
import dotenv from "dotenv";
dotenv.config();  

import express from "express";
import authRoutes from "./routes/auth-route.js";
import { connectDB } from "./config/db.js";

connectDB();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/test", (req, res) => {
  res.json({ message: "Server is running" });
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log("Server started on PORT:", port);
});
