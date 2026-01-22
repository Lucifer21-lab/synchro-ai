const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload Function
const uploadOnCloudinary = async (localFilePath, folderName = 'synchro-ai') => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detect (image, video, pdf, etc.)
            folder: folderName
        });

        // File has been uploaded successfully
        // Now remove the locally saved temporary file
        fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        // Upload failed
        // Remove the locally saved temporary file so the server doesn't get clogged
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
};

module.exports = { uploadOnCloudinary };