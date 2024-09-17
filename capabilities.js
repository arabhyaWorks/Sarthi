import axios from "axios";
import sendMessage from "./sendMessage";
const {
  WEBHOOK_VERIFY_TOKEN,
  GRAPH_API_TOKEN,
  PORT,
  WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_TOKEN,
} = process.env;
import { textToTextTranslationNMT } from "./bhashini";

async function sendCapabilties(
  business_phone_number_id,
  to,
  selectedLanguageCode
) {
  const introMessage = `
    Welcome to Vyapaar Launchpad! 🚀

    Vyapaar Launchpad is your all-in-one solution for managing your business across e-commerce platforms, especially ONDC. We help you:

    - 📋 Easily onboard your store on ONDC and other platforms like Amazon, Flipkart, and Meesho.
    - 📦 Catalog and manage your products, with options to upload existing store data, provide details through voice/text, or even scan your menu.
    - 📊 Receive real-time updates on orders, reviews, stock levels, and more, all directly to WhatsApp.
    - 🔍 Clear any doubts or myths you might have about e-commerce and how ONDC works, so you can make informed decisions.

    Would you like to start your store onboarding process now or ask any questions about Vyapaar Launchpad's capabilities?
  `;

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
          text: await textToTextTranslationNMT(
            "Do you want to start onboarding your store or ask a question?",
            selectedLanguageCode
          ),
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
}

export default sendCapabilties;
