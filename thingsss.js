const sendAudio = async (audioId, to) => {
    try {
      const response = await axios.post(
        "https://graph.facebook.com/v20.0/366490143206901/media",
        {
          messaging_product: "whatsapp",
          to: to,
          type: "audio",
          audio: {
            id: audioId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Audio sent to WhatsApp:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error Sending audio to whatsapp:", error.message);
      throw error;
    }
  };