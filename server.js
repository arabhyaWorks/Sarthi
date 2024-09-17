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

import {
  storeData,
  productData,
  processedProductdata,
} from "./functions/storeOnboarding.js";
import sendInteractiveButton from "./functions/interactiveButton.js";
import sendImageWithCaption from "./functions/imageWithCaption.js";
import sendInteractiveList from "./functions/interactiveList.js";
import processProductData from "./functions/processProductData.js";
import fetchProductDataFromUrl from './fetchAmazonData/scrapAmazon.js'

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

let selectedLanguageCode = "en";
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
    // console.dir(body.entry[0].changes[0].value.messages, {
    //   depth: null,
    //   colors: true,
    // });
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
            // console.dir(message);
            const messageText = message.text.body.toLowerCase();

            console.log(" ");
            console.error("Message Received");
            console.log(
              userName + ": ",
              messageText,
              "Service State:",
              serviceState
            );
            console.log("Service State:", serviceState);
            console.log(" ");

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
                  " ",
                  body,
                  " ",
                  buttonTitle,
                  list,
                  message.from
                );
              }

              // Step 1 - Shop Address
              else if (serviceState === "shop_address") {
                storeData.storeDetail.address = messageText;
                console.dir(storeData.storeDetail);
                serviceState = "shop_photos";

                const shopPhotosText = await textToTextTranslationNMT(
                  "Please upload your shop photos via the attachment button.",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  shopPhotosText
                );
              }

              // step 2 - Seller Name
              else if (serviceState === "seller_name") {
                storeData.sellerDetail.sellerName = messageText;
                console.log("Seller Name:", messageText);
                serviceState = "seller_aadhar_number";

                const enterAadhar = await textToTextTranslationNMT(
                  "Please enter your Aadhar number:",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  enterAadhar
                );
              }

              // step 2 - Seller Aadhar Number
              else if (serviceState === "seller_aadhar_number") {
                storeData.sellerDetail.aadharNumber = messageText;
                // console.dir(storeData.sellerDetail.aadharNumber);
                console.log("Aadhar Number:", messageText);

                serviceState = "seller_pan_number";

                const enterPan = await textToTextTranslationNMT(
                  "Please enter your PAN card number:",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  enterPan
                );
              }

              // step 2 - Seller PAN Number
              else if (serviceState === "seller_pan_number") {
                storeData.sellerDetail.panNumber = messageText;
                // console.dir(storeData.sellerDetail.panNumber);
                console.log("Pan:", messageText);

                serviceState = "seller_gst_number";

                const enterGST = await textToTextTranslationNMT(
                  "Please enter your shop's GST number:",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  enterGST
                );
              }

              // step 2 - Seller GST Number
              else if (serviceState === "seller_gst_number") {
                storeData.sellerDetail.gstNumber = messageText;
                console.log("gst:", messageText);

                serviceState = "seller_aadhar_image";

                const uploadAadhar = await textToTextTranslationNMT(
                  "Please upload your Aadhar card image via the attachment button.",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  uploadAadhar
                );
              }

              // step 3 - Account holder name
              else if (serviceState === "acc_holder_name") {
                storeData.bankDetails.accountHolderName = messageText;
                console.log("account holder name:", messageText);

                serviceState = "acc_number";

                const accNumber = await textToTextTranslationNMT(
                  "Please enter your bank account number:",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  accNumber
                );
              }

              // step 3 - Account number
              else if (serviceState === "acc_number") {
                storeData.bankDetails.accountNumber = messageText;
                console.log("account number:", messageText);

                serviceState = "bank_name";

                const bankName = await textToTextTranslationNMT(
                  "Please enter your Bank name:",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  bankName
                );
              }

              // step 3 - Bank Name
              else if (serviceState === "bank_name") {
                storeData.bankDetails.bankName = messageText;
                console.log("bank name:", messageText);

                serviceState = "ifsc_code";

                const ifscCode = await textToTextTranslationNMT(
                  "Please enter your IFSC code:",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  ifscCode
                );
              }

              // step 3 - IFSC Code
              else if (serviceState === "ifsc_code") {
                storeData.bankDetails.ifscCode = messageText;
                console.log("ifsc code:", messageText);

                serviceState = "cancelled_cheque";

                const uploadCheque = await textToTextTranslationNMT(
                  "Please upload your cancelled cheque image via the attachment button.",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  uploadCheque
                );
              }

              // Handling product cataloging
              // Product Title
              else if (serviceState === "product_title") {
                productData.title = messageText;
                console.log("Product Title:", messageText);
                serviceState = "product_price";

                const enterPrice = await textToTextTranslationNMT(
                  "Please enter the price of your product:",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  enterPrice
                );
              }

              // Product Price
              else if (serviceState === "product_price") {
                productData.price = messageText;
                console.log("Product Price:", messageText);
                serviceState = "product_quantity";

                const enterDescription = await textToTextTranslationNMT(
                  "Please enter the number of units you want to list:",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  enterDescription
                );
              }

              // Product Quantity
              else if (serviceState === "product_quantity") {
                productData.quantity = messageText;
                console.log("Product Quantity:", messageText);
                serviceState = "product_description";

                const enterDescription = await textToTextTranslationNMT(
                  "Please enter the description of your product:",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  enterDescription
                );
              }

              // Product Description
              else if (serviceState === "product_description") {
                productData.description = messageText;
                console.log("Product Description:", messageText);
                serviceState = "product_variation";

                const enterVariation = await textToTextTranslationNMT(
                  "Please enter the variation of your product:",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  enterVariation
                );
              }

              // Product Variation
              else if (serviceState === "product_variation") {
                productData.variation = messageText;
                console.log("Product Variation:", messageText);
                serviceState = "product_images";

                const uploadImages = await textToTextTranslationNMT(
                  "Please upload images of your product via the attachment button.",
                  selectedLanguageCode
                );
                await sendMessage(
                  business_phone_number_id,
                  message.from,
                  uploadImages
                );
              }

              else if (serviceState === "get_product_link") {
                const productData = await fetchProductDataFromUrl(messageText);
                console.log(productData);
                
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
            storeData.storeDetail.category =
              message.interactive.list_reply.id.slice(4);
            console.log("Selected Category: ", storeData.storeDetail.category);
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
            } else if (message.interactive.button_reply.id === "con_store") {
              // const congrats = textToTextTranslationNMT(
              //   "Congratulations! Your store is now being listed on the ONDC platform. The verification process may take up to 48 hours, after which your store will go live.",
              //   selectedLanguageCode
              // );
              const congrats = await textToTextTranslationNMT(
                "Congratulations! Your store is now live on the ONDC platform. You can view it through the Vyapar Launchpad Seller app, website, or by following this link [https://vyaparfrontend.vercel.app/Ajay-store]. To promote your store, you can also share your ONDC store QR code, which is provided below.",
                "hi"
              );

              const sendImage = await sendImageWithCaption(
                "https://ingenuityai.io/vyaparLaunchpad/AjayQR.png",
                congrats,
                message.from
              );

              if (sendImage) {
                const proButtons = [
                  {
                    id: "str_listing",
                    title: "Start Listing",
                  },
                  {
                    id: "ask_question",
                    title: "Ask a Question",
                  },
                ];

                const procatalog = await textToTextTranslationNMT(
                  "You can also manage your product catalog directly through WhatsApp. Would you like to do it now or later? Feel free to update your catalog at any time on any platform—WhatsApp, the app, or the website—based on your convenience. Additionally, if you have any questions or need help with day-to-day operations, we’re here to assist!",
                  selectedLanguageCode
                );

                sendInteractiveButton(procatalog, proButtons, message.from);
              }
            } else if (message.interactive.button_reply.id === "main_menu") {
              serviceState = "";
              // User was asking question now he wants to start onboarding or ask one more question
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
            } else if (message.interactive.button_reply.id === "str_listing") {
              // const enterTitleText = await textToTextTranslationNMT(
              //   "",
              //   selectedLanguageCode
              // );

              const heading = await textToTextTranslationNMT(
                "You can list your product using the following methods:",
                selectedLanguageCode
              );

              const t1 = await textToTextTranslationNMT(
                "Existing Store Link",
                selectedLanguageCode
              );
              const d1 = await textToTextTranslationNMT(
                "Provide the product link from platforms like Amazon, Google Shop, or Google Maps.",
                selectedLanguageCode
              );

              const t2 = await textToTextTranslationNMT(
                "Text or Voice Input",
                selectedLanguageCode
              );

              const d2 = await textToTextTranslationNMT(
                "Answer a guided questionnaire to submit product details.",
                selectedLanguageCode
              );

              const t3 = await textToTextTranslationNMT(
                "Upload Rate/Menu Card",
                selectedLanguageCode
              );

              const d3 = await textToTextTranslationNMT(
                "Scan and upload your rate card or menu card to list your products.",
                selectedLanguageCode
              );

              const footer = await textToTextTranslationNMT(
                "Ensure you have all product images and details ready. If needed, ask for assistance in obtaining the required documents or information before listing.",
                selectedLanguageCode
              );

              const msg = `*${heading}*\n\n*1. ${t1}:* ${d1}\n\n*2. ${t2}:* ${d2}\n\n*3. ${t3}:* ${d3}\n\n${footer}`;

              const buttons = [
                {
                  id: "exist_store",
                  title: "Product Link",
                },
                {
                  id: "text_voice",
                  title: "Text or Voice",
                },
                {
                  id: "upload_card",
                  title: "Upload Image",
                },
              ];

              sendInteractiveButton(msg, buttons, message.from);
            } else if (message.interactive.button_reply.id === "text_voice") {
              serviceState = "product_title";

              const someText = await textToTextTranslationNMT(
                "Statring the product listing process. Please enter the title of your product:",
                selectedLanguageCode
              );
              await sendMessage(
                business_phone_number_id,
                message.from,
                someText
              );
            } else if (message.interactive.button_reply.id === "exist_store") {
              serviceState = "get_product_link";

              const someText = await textToTextTranslationNMT(
                "Please enter the link of your product listed on Amazon, Flipkart, Myntra, Meesho etc:",
                selectedLanguageCode
              );
              await sendMessage(
                business_phone_number_id,
                message.from,
                someText
              );
            } else if (message.interactive.button_reply.id === "con_product") {
              console.log("confirm product processing");
              const diffText = await textToTextTranslationNMT(
                "Processing your product details and listing it on the ONDC platform. This may take a few minutes. You will receive a confirmation message once your product is live.",
                selectedLanguageCode
              );

              const processeddata = processProductData(
                productData.title,
                productData.description,
                productData.variation,
                productData.price
              );

              sendMessage(business_phone_number_id, message.from, diffText);

              processeddata.then((data) => {
                const processedText = `*${
                  processedProductdata.ProductName
                }*\n\n*Product Tag Line:* ${
                  processedProductdata.ProductTagline
                }\n\n*Description*\n\n${
                  processedProductdata.ProductDescription
                }\n\n*About the Product*\n\n${processedProductdata.AboutProduct.map(
                  (data, index) => {
                    return `*•* ${data}\n`;
                  }
                )}\n\n*Market Pain Points*\n\n${processedProductdata.MarketPainPoints.map(
                  (data, index) => {
                    return `*•* ${data}\n`;
                  }
                )}\n\n*Market Entry Strategy*\n\n${processedProductdata.MarketEntryStrategy.map(
                  (data, index) => {
                    return `*•* ${data}\n`;
                  }
                )}
                `;

                sendImageWithCaption(
                  storeOnboardingUri,
                  processedText,
                  message.from
                );
              });
            }
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

          // Handling image uploads
          else if (message?.type === "location") {
            // handle geolocation
            if (serviceState === "geo_location") {
              storeData.storeDetail.geolocation = message.location;
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

          // Handling image uploads
          else if (message?.type === "image") {
            if (serviceState === "shop_photos") {
              storeData.storeDetail.storePhotots = message.image;
              // console.log("Shop Photos:", storeData.storePhotots);
              console.dir(storeData.storeDetail, { depth: null, colors: true });
              serviceState = "seller_name";
              const congratsText = await textToTextTranslationNMT(
                "Congratulations! Step-1 of store onboarding is complete, your shop details have been successfully saved.",
                selectedLanguageCode
              );
              const enterSellerNameText = await textToTextTranslationNMT(
                "Please enter seller name as per Aadhar card:",
                selectedLanguageCode
              );

              await sendMessage(
                business_phone_number_id,
                message.from,
                congratsText
              );

              await sendMessage(
                business_phone_number_id,
                message.from,
                enterSellerNameText
              );
            }

            // step 2 - Seller Aadhar Image
            else if (serviceState === "seller_aadhar_image") {
              storeData.sellerDetail.aadharImage = message.image;
              // console.dir(storeData.sellerDetail.aadharImage);
              console.log("Aadhar image:", message.image);

              serviceState = "seller_pan_image";

              const uploadPan = await textToTextTranslationNMT(
                "Please upload your PAN card image via the attachment button.",
                selectedLanguageCode
              );
              await sendMessage(
                business_phone_number_id,
                message.from,
                uploadPan
              );
            }

            // step 2 - Seller PAN Image
            else if (serviceState === "seller_pan_image") {
              storeData.sellerDetail.panImage = message.image;
              // console.dir(storeData.sellerDetail.panImage);
              console.log("pan image:", message.image);
              serviceState = "seller_gst_image";

              const uploadGST = await textToTextTranslationNMT(
                "Please upload your GST certificate via the attachment button.",
                selectedLanguageCode
              );
              await sendMessage(
                business_phone_number_id,
                message.from,
                uploadGST
              );
            }

            // step 2 - Seller GST Image
            else if (serviceState === "seller_gst_image") {
              storeData.sellerDetail.gstImage = message.image;
              // console.dir(storeData.sellerDetail.gstImage);
              console.log("gst image:", message.image);
              serviceState = "acc_holder_name";

              const congratsText = await textToTextTranslationNMT(
                "Congratulations! Step-2 of store onboarding is complete, your seller details have been successfully saved.",
                selectedLanguageCode
              );

              const enterBankDetails = await textToTextTranslationNMT(
                "Please enter your bank account holder name:",
                selectedLanguageCode
              );
              await sendMessage(
                business_phone_number_id,
                message.from,
                congratsText
              );
              await sendMessage(
                business_phone_number_id,
                message.from,
                enterBankDetails
              );
            }

            // step 3 - Cancelled Cheque Image
            else if (serviceState === "cancelled_cheque") {
              storeData.bankDetails.cancelledCheque = message.image;
              // console.dir(storeData.bankDetails.cancelledCheque);
              console.log("cancelled cheque:", message.image);
              serviceState = "completed";

              const congratsText = await textToTextTranslationNMT(
                "Congratulations! Step-3 of store onboarding is complete, your bank details have been successfully saved.",
                selectedLanguageCode
              );

              const title = await textToTextTranslationNMT(
                "Please confirm the details provided by you, are given below:",
                "en"
              );

              const confirmText = `${title}\n\n*1. STORE DETAILS*\na. Shop Name: ${storeData.storeDetail.shopName}\nb. Shop Category: ${storeData.storeDetail.category}\nc. Address : ${storeData.storeDetail.address}\n\n*2. SELLER DETAILS*\na. Seller name : ${storeData.sellerDetail.sellerName}\nb. Aadhar number : ${storeData.sellerDetail.aadharNumber}\nc. Pan Number : ${storeData.sellerDetail.panNumber}\nd. GST number : ${storeData.sellerDetail.gstNumber}\n\n*3. BANK DETAILS*\na. Bank holder name : ${storeData.bankDetails.accountHolderName}\nb. Bank account number : ${storeData.bankDetails.accountNumber}\nc. Bank Name : ${storeData.bankDetails.bankName}\nd. IFSC code : ${storeData.bankDetails.ifscCode}`;

              await sendMessage(
                business_phone_number_id,
                message.from,
                congratsText
              );

              await sendMessage(
                business_phone_number_id,
                message.from,
                confirmText
              );

              sendInteractiveButton(
                "If the details are correct, please confirm. If you want to edit, please select edit.",
                [
                  {
                    id: "con_store",
                    title: "Confirm",
                  },
                  {
                    id: "con_edit",
                    title: "Edit",
                  },
                ],
                message.from
              );
            }

            // Handling product image uploads
            else if (serviceState === "product_images") {
              productData.productImages = [
                ...productData.productImages,
                message.image,
              ];

              console.log("product image:", message.image);
              serviceState = "raw_product_data";

              const congratsText = await textToTextTranslationNMT(
                "Congratulations! Your product details have been successfully saved.",
                selectedLanguageCode
              );

              const title = await textToTextTranslationNMT(
                "Please confirm the details provided by you, are given below:",
                selectedLanguageCode
              );

              const footer = await textToTextTranslationNMT(
                "If the details are correct, please confirm. If you want to edit, please select edit.",
                selectedLanguageCode
              );

              // confirmText

              const confirmText = `*${congratsText}*\n\n${title}\n\n*1. Product Name:* ${productData.title}\n*2. Price:* ${productData.price}\n*2. Quantity:* ${productData.quantity}\n*3. Descriptions:* ${productData.description}\n*4. Variation:* ${productData.variation}\n\n${footer}`;

              sendInteractiveButton(
                confirmText,
                [
                  {
                    id: "con_product",
                    title: "Confirm",
                  },
                  {
                    id: "con_pro_edit",
                    title: "Edit",
                  },
                ],
                message.from
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
                id: "str_listing",
                title: "Start Listing",
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
