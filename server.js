import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { textToTextTranslationNMT } from "./bhashini.js";
import { languages, languageKey } from "./constants.js";
import dotenv from "dotenv";
dotenv.config();

// // console.dir(object, { depth: null, colors: true });

import sendMessage from "./sendMessage.js";
import fetchAnswers from "./fetchAnswers.js";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import SpeechToText from "./stt.js";
import convertOggToWav from "./ogg2wav.js";
import downloadFile from "./downloadAudio.js";
import textToSpeech from "./ttsToOgg.js";

console.log("this is text")


const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

const {
  WEBHOOK_VERIFY_TOKEN,
  GRAPH_API_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_TOKEN,
} = process.env;

console.log("WEBHOOK_VERIFY_TOKEN", WEBHOOK_VERIFY_TOKEN);
console.log("GRAPH_API_TOKEN", GRAPH_API_TOKEN);  

let userName = "";
let userNumber = "";

let selectedLanguageCode = "";
let userStates = {};
let serviceState = "";

let shopName = "";
let stateName = "";
let productLanguage = "";
let productCategory = "";
let productTitle = "";
let productPrice = "";
let productDescription = "";
let productVariation = "";

app.post("/webhook", async (req, res) => {
  const body = req.body;
  console.log(body.entry[0].changes);

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
            } else {
              // const txt = await textToTextTranslationNMT(
              //   "Invalid selection. Please send 'hi' to start over.",
              //   selectedLanguageCode
              // );
              // await sendMessage(business_phone_number_id, message.from, txt);
              if (serviceState === "ask_question") {
                const answers = await fetchAnswers(messageText);
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  answers
                );
              }
            }

            await markMessageAsRead(business_phone_number_id, message.id);
          }

          // Handle languageSelection
          else if (
            message?.type === "interactive" &&
            message?.interactive?.type === "list_reply" &&
            message?.interactive?.list_reply?.id.startsWith("lang_")
          ) {
            selectedLanguageCode = message.interactive.list_reply.id.slice(5);
            console.log("Selected Language: ", selectedLanguageCode);
            // Handle Send Capabilities
            sendCapabilties(business_phone_number_id, message.from);

            await markMessageAsRead(business_phone_number_id, message.id);
          }

          // Handling all button replies
          else if (
            message?.type === "interactive" &&
            message?.interactive?.type === "button_reply"
          ) {
            if (message.interactive.button_reply.id === "ask_question") {
              serviceState = "ask_question";
              const txt = await textToTextTranslationNMT(
                "Please type your query or send a voice message.",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            } else if (
              message.interactive.button_reply.id === "start_onboarding"
            ) {
              serviceState = "start_onboarding";
              const txt = await textToTextTranslationNMT(
                "Let's onboard your Store. What is your shop's name?",
                selectedLanguageCode
              );
              await sendMessage(business_phone_number_id, message.from, txt);
            }
            await markMessageAsRead(business_phone_number_id, message.id);
          } else if (message?.type === "audio" && message.audio?.voice) {
            const audioId = message.audio.id;

            try {
              // const transcript = await downloadAudio(
              //   business_phone_number_id,
              //   audioId,
              //   message
              // );

              downloadAudio(
                business_phone_number_id,
                audioId,
                message,
                serviceState
              );
              // .then(
              //   (transcript) => {
              //     console.log("Transcript: ", transcript);
              //     sendMessage(
              //       business_phone_number_id,
              //       message.from,
              //       transcript
              //     );

              //   }
              // );
            } catch (error) {
              console.error("Error in STT processing:", error.message);
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
    "https://raw.githubusercontent.com/arabhyaWorks/Sarthi/main/vyaparLogo3-min.png?token=GHSAT0AAAAAACVW3TC2ZQJV7PWFNKX3AENWZXD6LZA";
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
        link: "https://mbagdtopics.com/wp-content/uploads/2024/01/ONDC-2-1.png",
        caption:
          "Welcome to Vyapaar Launchpad! Vyapaar Launchpad is your one-stop platform for e-commerce solutions. Let's list your product on ONDC",
      },
      context: {
        message_id: message.id,
      },
    },
  });

  //   Sending welcome message
  // await axios({
  //   method: "POST",
  //   url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
  //   headers: {
  //     Authorization: `Bearer ${GRAPH_API_TOKEN}`,
  //   },
  //   data: {
  //     messaging_product: "whatsapp",
  //     to: message.from,
  //     text: {
  //       body: "Welcome to Vyapaar Launchpad! Vyapaar Launchpad is your one-stop platform for e-commerce solutions. Let's list your product on ONDC",
  //     },
  //   },
  // });

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

const downloadAudio = async (
  business_phone_number_id,
  audioId,
  message,
  serviceState
) => {
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
          if (serviceState === "ask_question") {
            fetchAnswers(transcribedText).then((answers) => {
              textToSpeech(answers, message.from);
              sendMessage(business_phone_number_id, message.from, answers);
            });
          }
          // return transcribedText;

          // return transcribedText;
        })
        .catch((error) => {
          console.error("Error occurred:", error.message);
        });
    });
};

const sendCapabilties = async (business_phone_number_id, to) => {
  const introMessage = `
    Welcome to Vyapaar Launchpad! 🚀

    Vyapaar Launchpad is your all-in-one solution for managing your business across e-commerce platforms, especially ONDC. We help you:

    - 📋 Easily onboard your store on ONDC and other platforms like Amazon, Flipkart, and Meesho.
    - 📦 Catalog and manage your products, with options to upload existing store data, provide details through voice/text, or even scan your menu.
    - 📊 Receive real-time updates on orders, reviews, stock levels, and more, all directly to WhatsApp.
    - 🔍 Clear any doubts or myths you might have about e-commerce and how ONDC works, so you can make informed decisions.

    Would you like to start your store onboarding process now or ask any questions about Vyapaar Launchpad's capabilities?
  `;

  // console.log(introMessage)

  // Sending the introductory message first
  await sendMessage(business_phone_number_id, to, introMessage);

  // Sending the interactive button for onboarding or asking questions
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
          text: "Do you want to start onboarding your store or ask a question?",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "start_onboarding",
                title: "Start Onboarding",
              },
            },
            {
              type: "reply",
              reply: {
                id: "ask_question",
                title: "Ask a Question",
              },
            },
          ],
        },
      },
    },
  });
};
