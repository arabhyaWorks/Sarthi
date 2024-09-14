import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// const buttons = [
//   {
//     id: "start_onboarding",
//     title: "Start Onboarding",
//   },
//   {
//     id: "ask_question",
//     title: "Ask a Question",
//   },
// ];

const { GRAPH_API_TOKEN } = process.env;

const sendInteractiveButton = async (message, buttons, messageFrom) => {
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/366490143206901/messages`,
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
          text: message,
        },
        action: {
          //   buttons: [
          //     {
          //       type: "reply",
          //       reply: {
          //         id: "start_onboarding",
          //         title: "Start Onboarding",
          //       },
          //     },
          //     {
          //       type: "reply",
          //       reply: {
          //         id: "ask_question",
          //         title: "Ask a Question",
          //       },
          //     },
          //   ],
          buttons: buttons.map((button) => ({
            type: "reply",
            reply: button,
          })),
        },
      },
    },
  });
};


export default sendInteractiveButton;