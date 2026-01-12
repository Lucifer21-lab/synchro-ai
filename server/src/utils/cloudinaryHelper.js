const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { ApiError } = require('./apiResponse');

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file from the local 'uploads' folder to Cloudinary
 * Path to the file stored temporarily on the server
 * The Cloudinary folder name (e.g., 'submissions', 'avatars')
 */
const uploadOnCloudinary = async (localFilePath, folder = 'syncro-ai') => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detects image, pdf, video, etc.
            folder: folder
        });

        // File has been uploaded successfully, remove the locally saved temporary file
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        // Remove the locally saved temporary file as the upload operation failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
};

/**
 * Deletes a file from Cloudinary using its public ID
 * The public ID of the file on Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        return null;
    }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary };