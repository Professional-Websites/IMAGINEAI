const { Markup } = require('telegraf');
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
// Function to generate keyboard for start
function generateKeyboardForStart() {
  console.log('In keyboard');
  try {
    return Markup.inlineKeyboard([
      [Markup.button.callback('Text to Video 📝 ➡ 🎥', 'process1')],
      [Markup.button.callback('Image to Video 🖼 ➡ 🎥', 'process2')],
    ]);
  } catch (error) {
    console.error(
      'Error Occurred In generateKeyboardForStart: Error is ',
      error
    );
    throw error;
  }
}

async function sendVideo(ctx, videoUrl, thumbnailUrl) {
  try {
    console.log(
      `Inside sendVideo: Method started with parameters videourl is ${videoUrl} & thumbnailUrl is ${thumbnailUrl}`
    );
    const videoFilePath = `./videos/video${ctx.session.username}.mp4`;
    const writer = fs.createWriteStream(videoFilePath);
    const response = await axios.get(videoUrl, { responseType: 'stream' });

    response.data.pipe(writer);

    // Wait for the file to finish downloading
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Send the video with its thumbnail
    await ctx.replyWithVideo(
      { source: videoFilePath },
      { thumb: { url: thumbnailUrl } }
    );
    await ctx.reply('Video sent successfully!!');
    fs.unlinkSync(videoFilePath);
    console.log('SendVideo Method Ended');
  } catch (error) {
    console.error('Error occurred in sendVideo:', error);
    throw error;
  }
}

async function storeImage(ctx) {
  console.log('Inside storeImage: Method Started');
  try {
    const imageFilePath = `./images/image${ctx.session.username}.jpg`;
    const writer = fs.createWriteStream(imageFilePath);

    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const fileInfo = await ctx.telegram.getFile(photo.file_id);
    console.log('Inside storeImage: File Info is', fileInfo);
    const photoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;

    // Extract the file extension
    const fileExtension = fileInfo.file_path.split('.').pop().toLowerCase();

    // Check if the file extension is allowed
    const allowedExtensions = ['.png', '.jpeg', '.jpg', '.webp', '.gif'];
    if (!allowedExtensions.includes(`.${fileExtension}`)) {
      ctx.reply(
        'Please upload an image with .png, .jpeg, .webp, or .gif extension.'
      );
      return;
    }

    const response = await axios({
      url: photoUrl,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    // Wait for the file to finish downloading
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    console.log('StoreImage Method Ended');
  } catch (error) {
    console.error('Error occurred in storeImage: Error is ', error);
    throw error;
  }
}

module.exports = {
  generateKeyboardForStart,
  sendVideo,
  storeImage,
};
