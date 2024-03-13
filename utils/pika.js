const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const baseUrlToGenerate = 'https://api.pikapikapika.io/web/generate';
const baseUrlToFindJob = 'https://api.pikapikapika.io/web/jobs';

const requestBody = {
  promptText: 'Tiger walking in forest',
  options: {
    aspectRatio: '5:2',
    frameRate: 20,
    camera: {
      pan: 'right',
      tilt: 'up',
      rotate: 'cw',
      zoom: 'in',
    },
    parameters: {
      guidanceScale: 16,
      motion: 2,
      negativePrompt: 'ugly',
      seed: 144124,
    },
    extend: false,
  },
};

const config = {
  headers: {
    Authorization: `Bearer ${process.env.PIKA_AUTHORIZATION_TOKEN}`,
    'Content-Type': 'application/json',
  },
};

async function generateVideo(prompt, imageUrl) {
  console.log(
    `Inside generateVideo: Method started with Parameters prompt is ${prompt} & imageUrl is ${imageUrl}`
  );
  try {
    if (imageUrl) {
      requestBody['image'] = imageUrl;
    }
    requestBody['promptText'] = prompt;
    const response = await axios.post(baseUrlToGenerate, requestBody, config);
    const data = await response.data;
    console.log('GenerateVideo Method Ended Returning: Data is ', data);
    return data;
  } catch (error) {
    console.log('Error occurred in generateVideo: Error is ', error);
    throw error;
  }
}

async function getJobDeails(jobId) {
  console.log(
    `Inside getJobDetails: Method started with paramter jobId is ${jobId}`
  );
  try {
    const url = baseUrlToFindJob + `/${jobId}`;
    const response = await axios.get(url, config);
    const data = await response.data;
    console.log('getJobDeails Method Ended Returning: Data is ', data);
    return data;
  } catch (error) {
    console.log('Error occurred in getJobDeails: Error is ', error);
    throw error;
  }
}

async function pollJobStatus(jobId) {
  console.log(
    `Inside PollJobStatus, Method Started With Parameters jobId is ${jobId}`
  );
  let jobDetails;
  try {
    do {
      jobDetails = await getJobDeails(jobId);
      if (jobDetails.videos[0].status !== 'finished') {
        await new Promise((resolve) => setTimeout(resolve, 20000)); // Polling interval: 20 seconds
      }
    } while (jobDetails.videos[0].status !== 'finished');
    console.log(
      'PollJobStatus Method Ended Returning: jobDetails is ',
      jobDetails
    );
    return jobDetails;
  } catch (error) {
    console.error('Error occurred in pollJobStatus:', error);
    throw error;
  }
}

module.exports = { generateVideo, getJobDeails, pollJobStatus };
