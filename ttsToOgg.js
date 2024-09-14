import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";
import FormData from "form-data";
import dotenv from "dotenv";
import goBack from "./functions/goBack.js";


dotenv.config();

let sendToNumber = "+919452624111";

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
// console.log(GRAPH_API_TOKEN);

const textString =
  "Vyapar Launchpad is an innovative platform designed to assist small and medium-sized businesses in seamlessly entering and managing their presence across multiple e-commerce platforms, particularly focusing on the ONDC (Open Network for Digital Commerce) ecosystem. It simplifies the onboarding process for sellers, enabling them to set up their online stores with minimal effort through a user-friendly interface.";

// Text To Speech, WAV to OGG conversion

// Fix __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendAudio = async (audioId, messageFrom) => {
  try {
    // Make the API request to send the audio message
    const response = await axios.post(
      "https://graph.facebook.com/v20.0/366490143206901/messages",
      {
        messaging_product: "whatsapp",
        to: messageFrom, // The recipient's WhatsApp number
        type: "audio",
        audio: {
          id: audioId, // The audio ID you received from the previous media upload
        },
      },
      {
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`, // Your Bearer token
          "Content-Type": "application/json",
        },
      }
    );

    goBack(messageFrom);
  
    console.log("Audio sent to WhatsApp:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending audio to WhatsApp:", error.message);
    throw error;
  }
};
const getAudioId = async (location, messageFrom) => {
  try {
    // Create a FormData instance
    const formData = new FormData();

    // Specify the path to the OGG file
    const audioFilePath = path.join(__dirname, `${location}.ogg`);

    // Append the audio file and other required form data fields
    formData.append("file", fs.createReadStream(audioFilePath)); // Read file
    formData.append("type", "audio/ogg");
    formData.append("messaging_product", "whatsapp");

    // Make the API request
    const response = await axios.post(
      "https://graph.facebook.com/v20.0/366490143206901/media",
      formData,
      {
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          // Authorization: `Bearer EAALqsiz91T0BOZBuDte6gjd7Gtw3CjEhGiucEKSVUaZBzQPb9GWJWV6yRnpN7pCxSGn5LuYr8XyKYUfH5PBVUQoYP1GI0dqCtAmoqssZCDUZBCKk8MNehQ3ngWnp74fUQdm0LiJjpJADNdCXT7gi3iXEEZBQnTYND0frjlIOxFqkfzyfVyqmMoXacqHr7MALjyHFJZBJZBCWNEdVpTzIRWuhaaa72MZD`,
          ...formData.getHeaders(),
        },
      }
    );

    // Extract and return the media ID (audio ID)
    const audioId = response.data.id;
    console.log(`Audio ID: ${audioId}`);
    sendAudio(audioId, messageFrom);
    return audioId;
  } catch (error) {
    console.error("Error uploading audio:", error.message);
    throw error;
  }
};

// Fetch audio from TTS service
const fetchAudio = async (text) => {
  console.log("Fetching audio for text:", text);
  const ttsResponse = await axios.post(
    "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
    {
      pipelineTasks: [
        {
          taskType: "tts",
          config: {
            language: {
              sourceLanguage: "en",
            },
            serviceId: "ai4bharat/indic-tts-coqui-misc-gpu--t4",
            gender: "male",
            samplingRate: 6000,
          },
        },
      ],
      inputData: {
        input: [{ source: text }],
      },
    },
    {
      headers: {
        Authorization:
          "sk0Y4-IrxVJSOmP2V7umwEeUnxyWqCbvHSK4LzLRaAQ7yz4-_p6Mez3WTjD8-Bl0",
        "Content-Type": "application/json",
      },
    }
  );

  const audioContent =
    ttsResponse.data.pipelineResponse[0].audio[0].audioContent;
  if (audioContent) {
    return `data:audio/wav;base64,${audioContent}`;
  } else {
    console.error("No audio content found in the response");
    return null;
  }
};

// Download audio as a WAV file
const textToSpeech = async (text, messageFrom) => {
  const filename = "audios";
  const audioSrc = await fetchAudio(text);
  if (!audioSrc) {
    console.error("No audio content found in the response");
    return;
  }

  // Convert base64 to buffer
  const audioBuffer = Buffer.from(audioSrc.split(",")[1], "base64");
  const filePath = path.join(__dirname, `${filename}.wav`);

  // Write WAV file
  fs.writeFileSync(filePath, audioBuffer);
  console.log(`Audio saved to ${filePath}`);

  // Convert WAV to OGG
  await convertWavToOgg(filename, filename, messageFrom); // Use the same name for input/output
  console.log("Conversion successful!");
};

// Function to convert WAV to OGG
const convertWavToOgg = (input, output, messageFrom) => {
  const inputWav = path.join(__dirname, `${input}.wav`);
  const outputOgg = path.join(__dirname, `${output}.ogg`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputWav)
      .output(outputOgg)
      .audioCodec("libopus") // Use libvorbis codec for OGG format
      .on("end", () => {
        console.log(`Conversion to OGG completed: ${outputOgg}`);
        resolve(outputOgg);
        getAudioId(output, messageFrom);
      })
      .on("error", (err) => {
        console.error("Error during WAV to OGG conversion:", err.message);
        reject(err);
      })
      .run();
  });
};

// Example usage
// textToSpeech(textString,);
export default textToSpeech;
