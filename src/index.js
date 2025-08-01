import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";


dotenv.config({
    path:"./.env"
})


const PORT = 7000; 

connectDB()
.then(()=>{
    app.listen(PORT, ()=>{
    console.log(`Server is running at ${PORT}`);
})
})
.catch((err)=>{
    console.log("MongoDB connection error!! ");
})