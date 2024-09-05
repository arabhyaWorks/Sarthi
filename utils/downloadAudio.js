import fs from "fs";
import axios from "axios";


const downloadFile = async (mediaUrl, oggPath, GRAPH_API_TOKEN) => {
  try {
    const response = await axios({
      method: "get",
      url: mediaUrl,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      responseType: "stream",
    });

    const writer = fs.createWriteStream(oggPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Error downloading the file:", error);
  }
};

export default downloadFile;
