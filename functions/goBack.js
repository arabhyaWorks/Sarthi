import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import { textToTextTranslationNMT } from "../bhashini.js";

const { GRAPH_API_TOKEN, BUSINESS_PHONE_NUMBER_ID } = process.env;

const goBack = async (messageFrom, selectedLanguageCode) => {
  console.log("Going back to main menu");
  await axios({
    method: "POST",
    url: "https://graph.facebook.com/v20.0/366490143206901/messages",
    headers: {
      Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      to: messageFrom,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: await textToTextTranslationNMT(
            "You could ask more questions by typing your query, sending a voice message. or go back to main menu?",
            selectedLanguageCode
          ),
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "main_menu",
                title: "Main Menu",
              },
            },
          ],
        },
      },
    },
  });
};

export default goBack;
