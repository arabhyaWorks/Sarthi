import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const { GRAPH_API_TOKEN } = process.env;

const sendInteractiveList = async (
  header,
  body,
  footer,
  buttonTitle,
  list,
  messageFrom
) => {
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
        type: "list",
        header: {
          type: "text",
          text: header,
        },
        body: {
          text: body,
        },
        footer: {
          text: footer,
        },
        action: {
          button: buttonTitle,
          sections: [
            {
              title: buttonTitle,
              rows: list,
            },
          ],
        },
      },
    },
  });
};


export default sendInteractiveList;