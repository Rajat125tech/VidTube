import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get all videos with optional query, pagination, sorting, filtering
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const filters = {};
    if (query) {
        filters.title = { $regex: query, $options: "i" };
    }

    if (userId && isValidObjectId(userId)) {
        filters.owner = userId;
    }

    const sortOrder = sortType === "asc" ? 1 : -1;

    const videos = await Video.find(filters)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("owner", "username avatar");

    const total = await Video.countDocuments(filters);

    res.status(200).json(new ApiResponse(200, { videos, total }, "Videos fetched successfully"));
});

// Upload and publish a video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !req.files?.videoFile || !req.files?.thumbnailImage) {
        throw new ApiError(400, "Title, video, and thumbnail are required");
    }

    const videoResult = await uploadOnCloudinary(req.files.videoFile.tempFilePath, "video");
    const thumbnailResult = await uploadOnCloudinary(req.files.thumbnailImage.tempFilePath, "image");

    const video = await Video.create({
        title,
        description,
        videoUrl: videoResult.secure_url,
        thumbnail: thumbnailResult.secure_url,
        owner: req.user._id
    });

    res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
});

// Get single video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

// Update title, description or thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this video");
    }

    if (req.files?.thumbnailImage) {
        const thumbnailResult = await uploadOnCloudinary(req.files.thumbnailImage.tempFilePath, "image");
        video.thumbnail = thumbnailResult.secure_url;
    }

    if (title) video.title = title;
    if (description) video.description = description;

    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});

// Delete a video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this video");
    }

    await video.deleteOne();

    res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});

// Toggle video publish status (published/unlisted)
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unlisted"}`));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
