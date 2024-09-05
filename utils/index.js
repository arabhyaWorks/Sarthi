const audioId = "3729287580717653";
const business_phone_number_id = "366490143206901";

import axios from "axios";

const GRAPH_API_TOKEN =
  "EAALqsiz91T0BO5DMDRlLImxzjj9K848WWJbRHHTMySaOr7pfdHhGKJAOZCa3ncZBdSfMZCSZBEbwWT9CRd7Ie8qZBLDnmQ8zqZCAZBl9NPhpzD5dvZAx4B73YbpHl8hzagVClieH5nZC8NsZBHmi2cEW3VB3CxA03SBErq6KJgqJxO8I0llj4ZAnWkqF12uoblvP1uwo8rE0POjqGCcodlTNUcZD";


import FormData from "form-data";
import { fileURLToPath } from "url";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

import SpeechToText from "./STT.js";
import convertOggToWav from "./ogg2wav.js";
import downloadFile from "./downloadAudio.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadAudio = async (business_phone_number_id, audioId) => {
  const url = `https://graph.facebook.com/v16.0/${audioId}`;
  console.log("Fetching audio metadata from:", url);

  // Fetch metadata for the audio file
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${GRAPH_API_TOKEN}` },
  });

  // Extract the actual audio URL from the metadata
  const audioUrl = response.data.url;
  console.log("Actual audio URL:", audioUrl);

  // Now download the actual audio file
  const oggPath = path.join(__dirname, `${audioId}.ogg`);
  const wavPath = path.join(__dirname, `${audioId}.wav`);

  downloadFile(audioUrl, oggPath, GRAPH_API_TOKEN)
    .then(() => convertOggToWav(oggPath, wavPath))
    .then(async (wavPath) => {
      console.log("Conversion to WAV successful");
      // console.log(wavPath);

      SpeechToText(audioId)
        .then((transcribedText) => {
          console.log("Transcription Result:", transcribedText);
        })
        .catch((error) => {
          console.error("Error occurred:", error);
        });
    });
};

downloadAudio(business_phone_number_id, audioId)

