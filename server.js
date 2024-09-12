import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { textToTextTranslationNMT } from "./bhashini.js";
import { languages, languageKey } from "./constants.js";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import SpeechToText from "./stt.js";
import convertOggToWav from "./ogg2wav.js";
import downloadFile from "./downloadAudio.js";

const port = process.env.PORT || 3000;

dotenv.config();

const app = express();
app.use(bodyParser.json());

// const WHATSAPP_TOKEN = process.env.GRAPH_API_TOKEN;
// const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;
// const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const {
  WEBHOOK_VERIFY_TOKEN,
  GRAPH_API_TOKEN,
  PORT,
  WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_TOKEN,
} = process.env;

let userName = "";
let userNumber = "";

let selectedLanguageCode = "en";
let userStates = {};

let shopName = ""; // Global variable to store shop name
let stateName = ""; // Global variable to store state name
let productLanguage = ""; // Global variable to store product language
let productCategory = ""; // Global variable to store product category
let productTitle = ""; // Global variable to store product title
let productPrice = ""; // Global variable to store product price
let productDescription = ""; // Global variable to store product description
let productVariation = ""; // Global variable to store product variation

app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    const business_phone_number_id =
      req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

    userName =
      req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0]?.profile?.name ||
      "";

    userNumber =
      req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0]?.phone_number || "";

    const userLanguage =
      req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0]?.profile?.locale ||
      "en";

    const userState =
      userStates[req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0]?.id] ||
      {};

    for (const entry of body.entry) {
      const changes = entry.changes;
      for (const change of changes) {
        if (change.value && change.value.messages && change.value.messages[0]) {
          const message = change.value.messages[0];
          const senderId = message.from;

          if (message?.type === "text") {
            const messageText = message.text.body.toLowerCase();
            // console.log("User said : ",messageText);
            // console.log("Message object: ", message)
            console.log(userName, message.from, userLanguage, messageText);
            if (messageText === "hi") {
              await sendWelcomeMessage(business_phone_number_id, message);
            } else if (languages[messageText]) {
              selectedLanguageCode = languages[messageText];
              const selectedLanguage = Object.keys(languages).find(
                (lang) => languages[lang] === selectedLanguageCode
              );
              const responseText = `You have selected ${selectedLanguage}. The ISO code is ${selectedLanguageCode}.`;
              const translatedText = await textToTextTranslationNMT(
                responseText,
                selectedLanguageCode
              );
              await sendMessage(
                business_phone_number_id,
                message.from,
                translatedText,
                message.id
              );
              await sendProductCatalogingPrompt(
                business_phone_number_id,
                message.from
              );
            } else if (!shopName) {
              shopName = message.text.body;
              const txt = await textToTextTranslationNMT(
                "What is your state name?",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            } else if (!stateName) {
              stateName = message.text.body;
              const txt = await textToTextTranslationNMT(
                "What is your product's language?",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            } else if (!productLanguage) {
              productLanguage = message.text.body;
              const txt = await textToTextTranslationNMT(
                "What is your product's category?",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            } else if (!productCategory) {
              productCategory = message.text.body;
              const txt = await textToTextTranslationNMT(
                "What is your product's title?",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            } else if (!productTitle) {
              productTitle = message.text.body;
              const txt = await textToTextTranslationNMT(
                "What is your product's price?",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            } else if (!productPrice) {
              productPrice = message.text.body;
              const txt = await textToTextTranslationNMT(
                "What is your product's description?",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            } else if (!productDescription) {
              productDescription = message.text.body;
              const txt = await textToTextTranslationNMT(
                "Do you have any variations for the product?",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            } else if (!productVariation) {
              productVariation = message.text.body;
              const summaryText = `Thank you! Here is the information you provided:\nShop Name: ${shopName}\nState: ${stateName}\nProduct Language: ${productLanguage}\nProduct Category: ${productCategory}\nProduct Title: ${productTitle}\nProduct Price: ${productPrice}\nProduct Description: ${productDescription}\nProduct Variation: ${productVariation}`;
              const translatedSummaryText = await textToTextTranslationNMT(
                summaryText,
                selectedLanguageCode
              );
              await sendMessage(
                business_phone_number_id,
                message.from,
                translatedSummaryText
              );
            } else {
              const txt = await textToTextTranslationNMT(
                "Invalid selection. Please send 'hi' to start over.",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            }

            await markMessageAsRead(business_phone_number_id, message.id);
            //   } else if (
            //     message?.type === "interactive" &&
            //     message?.interactive?.type === "list_reply"
            //   ) {

            //     await sendMessage(
            //       business_phone_number_id,
            //       message.from,
            //       translatedText,
            //       message.id
            //     );
            //     await sendProductCatalogingPrompt(
            //       business_phone_number_id,
            //       message.from
            //     );
            //     await markMessageAsRead(business_phone_number_id, message.id);
          } else if (
            message?.type === "interactive" &&
            message?.interactive?.type === "list_reply" &&
            message?.interactive?.list_reply?.id.startsWith("lang_")
          ) {
            selectedLanguageCode = message.interactive.list_reply.id.slice(5);
            await sendProductCatalogingPrompt(
              business_phone_number_id,
              message.from
            );

            await markMessageAsRead(business_phone_number_id, message.id);
          } else if (
            message?.type === "interactive" &&
            message?.interactive?.type === "button_reply"
          ) {
            if (message.interactive.button_reply.id === "yes") {
              const txt = await textToTextTranslationNMT(
                "Let's start your product onboarding. What is your shop's name?",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            } else {
              const txt = await textToTextTranslationNMT(
                "Okay, let me know if you need anything.",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            }
            await markMessageAsRead(business_phone_number_id, message.id);
          } else if (message?.type === "audio" && message.audio?.voice) {
            const audioId = message.audio.id;

            try {
              downloadAudio(business_phone_number_id, audioId, message);
            } catch (error) {
              console.error("Error in STT processing:", error);
            }
          }
        }
      }
    }

    res.sendStatus(200);
  }
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});

async function sendWelcomeMessage(business_phone_number_id, message) {
  const imageUri =
    "https://vyaparbackend.s3.amazonaws.com/uploads/vyaparLogo2.jpeg";
  // Sending image
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
    headers: {
      Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      to: message.from,
      type: "image",
      image: {
        link: imageUri,
      },
      context: {
        message_id: message.id,
      },
    },
  });

  //   Sending welcome message
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
    headers: {
      Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      to: message.from,
      text: {
        body: "Welcome to Vyapaar Launchpad! Vyapaar Launchpad is your one-stop platform for e-commerce solutions. Let's list your product on ONDC",
      },
    },
  });

  //   Sending language selection list
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
    headers: {
      Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      to: message.from,
      type: "interactive",
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: "",
        },
        body: {
          text: "Please select a language from the following:\n\nकृपया भाषा का चयन करें:",
        },
        footer: {
          text: "Tap to select a language",
        },
        action: {
          button: "Select Language",
          sections: [
            {
              title: "Language Selection",
              rows: languages,
            },
          ],
        },
      },
    },
  });
}

async function sendMessage(
  business_phone_number_id,
  to,
  text,
  contextMessageId = null
) {
  const data = {
    messaging_product: "whatsapp",
    to: to,
    text: { body: text },
  };
  if (contextMessageId) {
    data.context = { message_id: contextMessageId };
  }

  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
    headers: {
      Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    },
    data: data,
  });
}

async function sendProductCatalogingPrompt(business_phone_number_id, to) {
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
    headers: {
      Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "Do you want to start product cataloging?",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "yes",
                title: "Yes",
              },
            },
            {
              type: "reply",
              reply: {
                id: "no",
                title: "No",
              },
            },
          ],
        },
      },
    },
  });
}

async function markMessageAsRead(business_phone_number_id, messageId) {
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
    headers: {
      Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    },
  });
}

const downloadAudio = async (business_phone_number_id, audioId, message) => {
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
          sendMessage(business_phone_number_id, message.from, transcribedText);

          // return transcribedText;
        })
        .catch((error) => {
          console.error("Error occurred:", error);
        });
    });
};
