import axios from "axios";
const { GRAPH_API_TOKEN } = process.env;

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

export default sendMessage;