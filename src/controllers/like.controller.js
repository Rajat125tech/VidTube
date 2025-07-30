import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleLike = async (userId, refId, refModel) => {
    const existingLike = await Like.findOne({
        user: userId,
        refId,
        refModel
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return { liked: false };
    } else {
        await Like.create({
            user: userId,
            refId,
            refModel
        });
        return { liked: true };
    }
};

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const result = await toggleLike(req.user._id, videoId, "Video");

    res.status(200).json(
        new ApiResponse(200, result, result.liked ? "Video liked" : "Video unliked")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const result = await toggleLike(req.user._id, commentId, "Comment");

    res.status(200).json(
        new ApiResponse(200, result, result.liked ? "Comment liked" : "Comment unliked")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const result = await toggleLike(req.user._id, tweetId, "Tweet");

    res.status(200).json(
        new ApiResponse(200, result, result.liked ? "Tweet liked" : "Tweet unliked")
    );
});

co
