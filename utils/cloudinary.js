const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(photoPath) {
  console.log(
    `Inside uploadToCloudinary Method Started With Parameters: photoPath is ${photoPath}`
  );
  try {
    const result = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath);
    console.log(
      `UploadToCloudinary Method Ended Returning: Url is ${result.url}`
    );
    return result.url;
  } catch (error) {
    console.error('Error occurred in uploadToCloudinary: Error is ', error);
    throw error;
  }
}

module.exports = { uploadToCloudinary };
