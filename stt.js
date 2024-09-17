// import fs from "fs";
// import FormData from "form-data";
// import axios from "axios";

// // Sarvam Asr

// const SpeechToText = async (
//   audioId,
//   languageCode = "hi-IN",
//   model = "saarika:v1"
// ) => {
//   console.log("Transcribing audio file:", `${audioId}.wav`);
//   const form = new FormData();
//   form.append("file", fs.createReadStream(`${audioId}.wav`));
//   form.append("language_code", languageCode);
//   form.append("model", model);

//   try {
//     const response = await axios.post(
//       "https://api.sarvam.ai/speech-to-text",
//       form,
//       {
//         headers: {
//           ...form.getHeaders(),
//           "api-subscription-key": "cfe1250e-0f42-4e80-9064-e5f5c7864709",
//         },
//       }
//     );

//     fs.unlink(`${audioId}.wav`, (err) => {
//       if (err) {
//         console.error(`Error deleting file`, err);
//       } else {
//         console.log(`File deleted`);
//       }
//     });

//     fs.unlink(`${audioId}.ogg`, (err) => {
//       if (err) {
//         console.error(`Error deleting file`, err);
//       } else {
//         console.log(`File deleted`);
//       }
//     });

//     console.log("Transcribed text:", response.data.transcript);
//     return response.data.transcript;
//   } catch (error) {
//     console.error("Error in Speech-to-Text API request:", error);
//     throw error;
//   }
// };

// export default SpeechToText;

import fs from "fs";
import axios from "axios";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get __dirname equivalent in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to read the ogg file and convert it to base64
const convertToBase64 = (filePath) => {
  const file = fs.readFileSync(filePath);
  return file.toString("base64");
};

// Function to send request to API for speech-to-text
const speechToText = async (audioId, selectedLanguageCode) => {
  // Convert ogg file to Base64
  const filePath = join(__dirname, `${audioId}.ogg`); // Adjust to the correct path

  const base64Audio = convertToBase64(filePath);

  // API request payload
  const requestBody = {
    pipelineTasks: [
      {
        taskType: "asr",
        config: {
          language: {
            sourceLanguage: "hi",
          },
          serviceId: "ai4bharat/conformer-hi-gpu--t4",
          audioFormat: "ogg",
          samplingRate: 16000,
        },
      },
    ],
    inputData: {
      audio: [
        {
          audioContent: base64Audio,
        },
      ],
    },
  };

  // API request headers
  const headers = {
    Accept: "*/*",
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    Authorization:
      "ZZiuNxfnJBUTWXXZmxQ7Wm6xk-R7vBZaFIZjf7nse8UXe3Oc4r4B_YW9KMgwZI_M", // Your API key
    "Content-Type": "application/json",
  };

  try {
    // Send POST request to API
    const response = await axios.post(
      "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
      requestBody,
      { headers }
    );

    // Log the entire response for debugging purposes
    console.log("API Response:", response.data);

    const transcribedText = response.data;

    // Extract and return transcribed text (add null-checking to avoid undefined issues)
    // const transcribedText = response.data?.pipelineTasks?.[0]?.outputData?.source || 'Transcription not found';
    return transcribedText.pipelineResponse[0].output[0].source;
  } catch (error) {
    console.error("Error during transcription:", error.message);
    return null;
  }
};

// Define the path to your .ogg file

// // Example usage
// speechToText(audioId).then((transcribedText) => {
//   console.dir(transcribedText, { depth: null, color:true });
// });

export default speechToText;
