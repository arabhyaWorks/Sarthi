import express from "express";
import axios from "axios";
import { textToTextTranslationNMT } from "./bhashini.js";

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT } = process.env;

let selectedLanguageCode = ""; // Global variable to store the selected language
let shopName = ""; // Global variable to store shop name
let stateName = ""; // Global variable to store state name
let productLanguage = ""; // Global variable to store product language
let productCategory = ""; // Global variable to store product category
let productTitle = ""; // Global variable to store product title
let productPrice = ""; // Global variable to store product price
let productDescription = ""; // Global variable to store product description
let productVariation = ""; // Global variable to store product variation

const languages = {
  english: "en",
  hindi: "hi",
  kannada: "kn",
  tamil: "ta",
  marathi: "mr",
  punjabi: "pa",
  assamese: "as",
  odia: "or",
  bengali: "bn",
  telugu: "te",
};

app.post("/webhook", async (req, res) => {
  console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
  const business_phone_number_id =
    req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

  if (message?.type === "text") {
    const messageText = message.text.body.toLowerCase();

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
      await sendProductCatalogingPrompt(business_phone_number_id, message.from);
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
  } else if (
    message?.type === "interactive" &&
    message?.interactive?.type === "list_reply"
  ) {
    selectedLanguageCode = message.interactive.list_reply.id;
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
    await sendProductCatalogingPrompt(business_phone_number_id, message.from);
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
  }

  res.sendStatus(200);
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
        link: "https://firebasestorage.googleapis.com/v0/b/nagarnigamayodhya-2fb11.appspot.com/o/Banner%203_v1.jpg?alt=media&token=93c5196c-a596-469e-8ab4-607100b09ccb",
      },
      context: {
        message_id: message.id,
      },
    },
  });

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

  const sections = [
    {
      title: "Language Selection",
      rows: Object.keys(languages).map((lang) => ({
        id: languages[lang],
        title: lang.charAt(0).toUpperCase() + lang.slice(1),
      })),
    },
  ];

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
          text: "Welcome!",
        },
        body: {
          text: "Please select a language from the following:",
        },
        footer: {
          text: "Tap to select a language",
        },
        action: {
          button: "Select Language",
          sections: sections,
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