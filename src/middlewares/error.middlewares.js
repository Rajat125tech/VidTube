import mongoose, { MongooseError } from "mongoose";
import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, req, res ,next) => {
    let error = err
    if(!(error instanceof ApiError)){
        const statusCode = error.statusCode || error instanceof mongoose.Error? 400: 500
        const message = error.message || "Something went wrong"
        error = new ApiError(statusCode, message, error?.errors || [], err.stack)
    }

    const Response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ?{stack: error.stack} : {})
    }

    return res.status(error.statusCode).json(Response);
}

export {errorHandler};