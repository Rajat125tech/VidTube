import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try {
        const connection = await mongoose.connect("mongodb+srv://vidtubeuser:vidtubeuser1234@cluster0.fhrmq3r.mongodb.net/vidtube");
        console.log("MongoDB connected");
    } catch (error) {
        console.log("MongooseDB Connection Error:", error);
        process.exit(1);
    }
}

export default connectDB;
