require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const uploadToCloudinary = async (userId, directoryId, filePathOnServer) => {
  cloudinary.config({
    secure: true,
  });

  try {
    const uploadResult = await cloudinary.uploader.upload(filePathOnServer, {
      folder: `${userId}/${directoryId}`,
    });

    return uploadResult;
  } catch (err) {
    console.error("Error at uploading file to Cloudinary:", err.message);
    throw err;
  }
};

module.exports = uploadToCloudinary;
