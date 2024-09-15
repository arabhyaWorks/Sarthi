import axios from "axios";

const processProductData = async (
  productTitle,
  productDescription,
  productVariation,
  pricing
) => {
  const response = await axios.post(
    "http://127.0.0.1:8000/process/",
    {
      prompt: productTitle,
      description: productDescription,
      variation: productVariation,
      pricing: pricing,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "PostmanRuntime/7.39.0",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
      },
    }
  );
  console.dir(response.data, { depth: null , color: true});

  return response.data;
};


export default processProductData;
