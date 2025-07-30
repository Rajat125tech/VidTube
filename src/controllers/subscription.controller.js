import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription: if already subscribed, unsubscribe; otherwise, subscribe
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (channelId === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const existing = await Subscription.findOne({ channel: channelId, subscriber: subscriberId });

    if (existing) {
        // Unsubscribe
        await Subscription.deleteOne({ _id: existing._id });
        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    }

    // Subscribe
    await Subscription.create({
        channel: channelId,
        subscriber: subscriberId
    });

    res.status(201).json(new ApiResponse(201, null, "Subscribed successfully"));
});

// Get list of subscribers for a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber", "username email");

    res.status(200).json(new ApiResponse(200, subscribers, "Channel subscribers fetched"));
});

// Get list of channels the user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const channels = await Subscription.find({ subscriber: subscriberId }).populate("channel", "username email");

    res.status(200).json(new ApiResponse(200, channels, "Subscribed channels fetched"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
