import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET: Get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const comments = await Comment.find({ video: videoId })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 }); // newest first

  const total = await Comment.countDocuments({ video: videoId });

  res.status(200).json(
    new ApiResponse(200, {
      comments,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }, "Comments fetched successfully")
  );
});

// POST: Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!text) {
    throw new ApiError(400, "Comment text is required");
  }

  const comment = await Comment.create({
    user: req.user._id,
    video: videoId,
    text,
  });

  res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});

// PUT: Update a comment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  comment.text = text || comment.text;
  await comment.save();

  res.status(200).json(new ApiResponse(200, comment, "Comment updated"));
});

// DELETE: Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await comment.deleteOne();

  res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
};
