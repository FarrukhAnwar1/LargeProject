import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI)
        
        console.log(`MongoDB connected: ${connection.connection.host}`);
    }catch (error){
        console.error("Error connecting to MONGODB", error);
        process.exit(1) //exit with failure

    }
}