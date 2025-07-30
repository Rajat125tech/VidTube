import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.params.channelId;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const [totalVideos, totalViews, totalSubscribers, totalLikes] = await Promise.all([
        Video.countDocuments({ owner: channelId }),
        Video.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
            { $group: { _id: null, views: { $sum: "$views" } } }
        ]),
        Subscription.countDocuments({ channel: channelId }),
        Like.countDocuments({ refModel: "Video", user: channelId }) // This assumes the channel liked videos
    ]);

    res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalViews: totalViews[0]?.views || 0,
            totalSubscribers,
            totalLikes
        }, "Channel stats fetched")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.params.channelId;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const videos = await Video.find({ owner: channelId });

    res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched")
    );
});

export {
    getChannelStats,
    getChannelVideos
};
