import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();


cloudinary.config({ 
        cloud_name: "dfzd9wsrg", 
        api_key: "774958669576238", 
        api_secret: "isY1XhdAR8ZYcQ59sOdbzuEA6CQ"
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("❌ No file path provided");
            return null;
        }

        // Verify file exists and is readable
        if (!fs.existsSync(localFilePath)) {
            console.error(`❌ File not found at path: ${localFilePath}`);
            return null;
        }

        // Add small delay to ensure file is fully written
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            timeout: 30000, // 30 seconds timeout
            chunk_size: 6000000 // 6MB chunks for larger files
        });

        console.log("✅ Upload successful:", response.secure_url);
        
        // Double-check before deleting
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        
        return response;
    } catch (error) {
        console.error("❌ Cloudinary upload error:", error.message);
        // Clean up temp file if it exists
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from cloudinary. Public id", publicId);
  } catch (error) {
    console.log("Error deleting from cloudinary", error);
    return null;
  }
};


export {uploadOnCloudinary, deleteFromCloudinary};