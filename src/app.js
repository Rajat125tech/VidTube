import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config({
    path:"./.env"
})

const app = express();
app.use(cookieParser())
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials : true
    })
)
app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({extended : true, limit: "16kb"}))
app.use(express.static("public"))

import healthcheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/users.route.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
app.use("/api/v1/healthcheck",healthcheckRouter);
app.use("/api/v1/users",userRouter);
app.use(errorHandler);
export { app };