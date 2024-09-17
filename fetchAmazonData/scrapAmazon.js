import axios from "axios";
import fs from "fs";

// Function to extract ASIN from Amazon product URL
function getAsinFromUrl(url) {
  const asinMatch = url.match(/\/([A-Z0-9]{10})(?:[\/?]|$)/);
  const data = asinMatch ? asinMatch[1] : null;
  console.log(data)
  return data;
}

// Function to fetch product data using the ASIN code
async function fetchProductDataFromUrl(productUrl) {
  const asin = getAsinFromUrl(productUrl);

  if (!asin) {
    console.error("ASIN not found in the URL.");
    return;
  }

  // Structure payload
  const payload = {
    source: "amazon_product",
    query: asin,
    domain: "in", // change this based on your region, e.g. 'in' for India
    geo_location: "221010",
    parse: true,
  };

  try {
    const response = await axios.post(
      "https://realtime.oxylabs.io/v1/queries",
      payload,
      {
        auth: {
          username: "arabhaya_SfWiG",
          password: "Arabhaya7+9=16", // Your credentials go here
        },
      }
    );

    // Extract product data
    const productData = {
      title: response.data.results[0].content.title,
      price: response.data.results[0].content.price,
      about: response.data.results[0].content.bullet_points,
      description: response.data.results[0].content.description,
      images: response.data.results[0].content.images,
    };

    console.log(productData);

    // Save response to a file (optional)
    // fs.writeFile('output.json', JSON.stringify(productData, null, 4), (err) => {
    //   if (err) throw err;
    //   console.log('Response saved to output.json');
    // });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Example usage with the product URL
// const productUrl =
//   "https://www.amazon.in/Gold-Art-India-Dashboard-Antique/dp/B0D25LKWWW/?_encoding=UTF8";
// fetchProductDataFromUrl(productUrl);

export default fetchProductDataFromUrl;
