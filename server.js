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

import storeData from "./functions/storeOnboarding.js";
import sendInteractiveButton from "./functions/interactiveButton.js";
import sendImageWithCaption from "./functions/imageWithCaption.js";
import sendInteractiveList from "./functions/interactiveList.js";

const storeOnboardingUri =
  "https://ingenuityai.io/vyaparLaunchpad/storeOnboarding.png";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

const {
  WEBHOOK_VERIFY_TOKEN,
  GRAPH_API_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_TOKEN,
} = process.env;

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

  if (body.object === "whatsapp_business_account") {
    // console.log(body.entry[0][0].value)
    // console.dir(body, { depth: null, colors: true });
    // changes: [ { value: [Object], field: 'messages' } ]
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

          // console.dir(message, { depth: null, colors: true });

          await markMessageAsRead(business_phone_number_id, message.id);

          if (message?.type === "text") {
            console.error("Message Received");
            console.dir(message);
            const messageText = message.text.body.toLowerCase();
            // console.log(userName, message.from, userLanguage, messageText);
            console.log("Message Text:", messageText);
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
                await textToSpeech(answers, message.from);

                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  answers
                );
              }

              // Handling store onboarding
              // Step 1 - Shop Name
              else if (serviceState === "shop_name") {
                storeData.storeDetail.shopName = messageText;
                console.dir(storeData.storeDetail);
                serviceState = "shop_category";

                const enterStateText = await textToTextTranslationNMT(
                  "Please select the category of your shop.From the following options",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  enterStateText
                );

                const body = await textToTextTranslationNMT(
                  "Which of these best describes your products?\n\nPlease select the category of your shop.",
                  selectedLanguageCode
                );

                const buttonTitle = await textToTextTranslationNMT(
                  "Select Category",
                  selectedLanguageCode
                );
                const list = storeData.storeDetail.category;

                await sendInteractiveList(
                  "",
                  body,
                  "",
                  buttonTitle,
                  list,
                  message.from
                );
              }
            }
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

            // await markMessageAsRead(business_phone_number_id, message.id);
          }
          

          // handle shop category selection
          else if (
            message?.type === "interactive" &&
            message?.interactive?.type === "list_reply" &&
            message?.interactive?.list_reply?.id.startsWith("cat_")
          ) {
            productCategory = message.interactive.list_reply.id.slice(4);
            console.log("Selected Category: ", productCategory);
            serviceState = "geo_location";
            const enterTitleText = await textToTextTranslationNMT(
              "Please upload your shop geolocation via the attachment button.",
              selectedLanguageCode
            );
            await sendMessage(
              business_phone_number_id,
              message.from,
              enterTitleText
            );
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
              message.interactive.button_reply.id === "store_onboarding"
            ) {
              serviceState = "store_onboarding";
              const title = await textToTextTranslationNMT(
                "Get your store listed with Vyapaar Launchpad",
                selectedLanguageCode
              );

              const h1 = await textToTextTranslationNMT(
                "Enter your Store Details",
                selectedLanguageCode
              );
              const s1 = await textToTextTranslationNMT(
                "Provide your shop name, address, and other essential information. This helps customers find and learn about your offerings.",
                selectedLanguageCode
              );

              const h2 = await textToTextTranslationNMT(
                "Enter Seller Details",
                selectedLanguageCode
              );
              const s2 = await textToTextTranslationNMT(
                "Share your name, Aadhar, PAN card and other legal documents. This ensures customers can easily reach you for inquiries and orders.",
                selectedLanguageCode
              );

              const h3 = await textToTextTranslationNMT(
                "Enter Bank Details",
                selectedLanguageCode
              );
              const s3 = await textToTextTranslationNMT(
                "Provide your bank account number and bank name securely. This enables smooth financial transactions for your business.",
                selectedLanguageCode
              );

              const enterNameText = await textToTextTranslationNMT(
                "I am going to start the store onboarding process. Please enter your shop name:",
                selectedLanguageCode
              );

              const formattedMessage = `*${title}*\n\n*1. ${h1}*\n${s1}\n\n*2. ${h2}*\n${s2}\n\n*3. ${h3}*\n${s3}`;

              const imageSent = await sendImageWithCaption(
                storeOnboardingUri,
                formattedMessage,
                message.from
              );

              if (imageSent) {
                // Sending message for starting the store onboarding process
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  enterNameText
                );

                serviceState = "shop_name";
              }

              // console.log("Image Sent:", imageSent);
            } else if (message.interactive.button_reply.id === "main_menu") {
              serviceState = "";
              let txt =
                "Do you want to start onboarding your store or ask a question?";
              let buttons = [
                {
                  id: "store_onboarding",
                  title: "Start Onboarding",
                },
                {
                  id: "ask_question",
                  title: "Ask a Question",
                },
              ];

              sendInteractiveButton(txt, buttons, message.from);
            }
            // await markMessageAsRead(business_phone_number_id, message.id);
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
          } else if (message?.type === "location") {

            // handle geolocation
            if (serviceState === "geo_location") {
              storeData.geolocation = message.location;
              console.log("Location:", message.location);
              serviceState = "shop_address";
              const enterAddressText = await textToTextTranslationNMT(
                "Please enter your shop address in the following format: Shop Number, Street, Locality, City, State, Pincode",
                selectedLanguageCode
              );
              await sendMessage(
                business_phone_number_id,
                message.from,
                enterAddressText
              );
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
                id: "store_onboarding",
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
