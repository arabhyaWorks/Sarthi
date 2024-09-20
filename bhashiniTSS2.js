import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";
import FormData from "form-data";
import dotenv from "dotenv";
import goBack from "./functions/goBack.js";
import ttsServiceId from "./bhashini/ttsServiceId.js";

dotenv.config();

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

// Fix __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to send audio to WhatsApp
const sendAudio = async (audioId, messageFrom, selectedLanguageCode) => {
  try {
    const response = await axios.post(
      "https://graph.facebook.com/v20.0/366490143206901/messages",
      {
        messaging_product: "whatsapp",
        to: messageFrom,
        type: "audio",
        audio: {
          id: audioId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Audio sent to WhatsApp:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending audio to WhatsApp:", error.message);
    return null; // Ensure error does not crash the app
  }
};

// Function to get the audio ID after uploading the file
const getAudioId = async (location, messageFrom, selectedLanguageCode) => {
  try {
    const formData = new FormData();
    const audioFilePath = path.join(__dirname, `${location}.ogg`);
    formData.append("file", fs.createReadStream(audioFilePath));
    formData.append("type", "audio/ogg");
    formData.append("messaging_product", "whatsapp");

    const response = await axios.post(
      "https://graph.facebook.com/v20.0/366490143206901/media",
      formData,
      {
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          ...formData.getHeaders(),
        },
      }
    );

    const audioId = response.data.id;
    console.log(`Audio ID: ${audioId}`);
    await sendAudio(audioId, messageFrom, selectedLanguageCode);
    return audioId;
  } catch (error) {
    console.error("Error uploading audio:", error.message);
    return null; // Prevent crash, return null on failure
  }
};

// Fetch audio from the TTS service
const fetchAudio = async (text, selectedLanguageCode) => {
  try {
    console.log("Fetching audio for text:", text);
    const ttsResponse = await axios.post(
      "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
      {
        pipelineTasks: [
          {
            taskType: "tts",
            config: {
              language: {
                sourceLanguage: selectedLanguageCode,
              },
              serviceId: ttsServiceId[selectedLanguageCode],
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
          Authorization: process.env.BHASHINI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const audioContent =
      ttsResponse.data?.pipelineResponse?.[0]?.audio?.[0]?.audioContent;
    if (!audioContent) {
      console.error("No audio content found in the response");
      return null; // Return null if no audio content is found
    }

    return `data:audio/wav;base64,${audioContent}`;
  } catch (error) {
    console.error("Error fetching audio from TTS API:", error.message);
    console.dir(error, { depth: null, color:true });
    if (error.response?.status === 500) {
      console.error("Internal Server Error from TTS API (500)");
    }
    return null; // Return null on error, do not crash
  }
};

// Download audio as a WAV file
const bhashiniTTS = async (text, messageFrom, selectedLanguageCode) => {
  const filename = "audios";
  const audioSrc = await fetchAudio(text, selectedLanguageCode);
  if (!audioSrc) {
    console.error("No audio content found or error occurred during fetch.");
    return;
  }

  // Convert base64 to buffer
  const audioBuffer = Buffer.from(audioSrc.split(",")[1], "base64");
  const filePath = path.join(__dirname, `${filename}.wav`);

  // Write WAV file
  fs.writeFileSync(filePath, audioBuffer);
  console.log(`Audio saved to ${filePath}`);

  // Convert WAV to OGG
  try {
    await convertWavToOgg(
      filename,
      filename,
      messageFrom,
      selectedLanguageCode
    );
    console.log("Conversion successful!");
  } catch (error) {
    console.error("Error during WAV to OGG conversion:", error.message);
  }
};

// Function to convert WAV to OGG
const convertWavToOgg = (input, output, messageFrom, selectedLanguageCode) => {
  const inputWav = path.join(__dirname, `${input}.wav`);
  const outputOgg = path.join(__dirname, `${output}.ogg`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputWav)
      .output(outputOgg)
      .audioCodec("libopus")
      .on("end", async () => {
        console.log(`Conversion to OGG completed: ${outputOgg}`);
        try {
          await getAudioId(output, messageFrom, selectedLanguageCode);
          resolve(outputOgg);
        } catch (error) {
          console.error("Error in getting Audio ID:", error.message);
          reject(error);
        }
      })
      .on("error", (err) => {
        console.error("Error during WAV to OGG conversion:", err.message);
        reject(err);
      })
      .run();
  });
};

const text =
  "Hey there this vyapar launchpad we are working to democratice e-commerce in india";

bhashiniTTS(text, "+919452624111", "en");

// export default bhashiniTTS;
