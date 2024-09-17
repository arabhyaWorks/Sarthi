import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

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

    console.log("Audio sent to WhatsApp:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending audio to WhatsApp:", error.message);
    throw error;
  }
};

export default sendAudio;
