import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const { GRAPH_API_TOKEN } = process.env;

const sendImageWithCaption = async (uri, caption, messageFrom) => {
  try {
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/366490143206901/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        to: messageFrom,
        type: "image",
        image: {
          link: uri,
          caption: caption,
        },
      },
    });

    // Check if the response is successful (status code 2xx)
    if (response.status >= 200 && response.status < 300) {
      return true; // return true if the post was successful
    }
  } catch (error) {
    console.error("Error sending image with caption:", error);
    return false; // return false if there was an error
  }
};

export default sendImageWithCaption;
