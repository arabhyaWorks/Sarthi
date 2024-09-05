import fs from "fs";
import FormData from "form-data";
import axios from "axios";

const SpeechToText = async (
  audioId,
  languageCode = "hi-IN",
  model = "saarika:v1"
) => {
  console.log("Transcribing audio file:", `${audioId}.wav`);
  const form = new FormData();
  form.append("file", fs.createReadStream(`${audioId}.wav`));
  form.append("language_code", languageCode);
  form.append("model", model);

  try {
    const response = await axios.post(
      "https://api.sarvam.ai/speech-to-text",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "api-subscription-key": "cfe1250e-0f42-4e80-9064-e5f5c7864709", 
        },
      }
    );

    fs.unlink(`${audioId}.wav`, (err) => {
      if (err) {
        console.error(`Error deleting file`, err);
      } else {
        console.log(`File deleted`);
      }
    });

    fs.unlink(`${audioId}.ogg`, (err) => {
      if (err) {
        console.error(`Error deleting file`, err);
      } else {
        console.log(`File deleted`);
      }
    });

    console.log("Transcribed text:", response.data.transcript);
    return response.data.transcript;
  } catch (error) {
    console.error("Error in Speech-to-Text API request:", error);
    throw error;
  }
};

export default SpeechToText;
