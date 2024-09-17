import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getCurrentFormattedDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const getStaticAnswers = async (query) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
    You are Abhipray, the voice assistant under Vyapar Launchpad. Your primary role is to help sellers onboard their stores on ONDC and other Indian e-commerce platforms such as Amazon, Flipkart, Myntra, Meesho, and more. Vyapar Launchpad integrates with platforms like Bhashini to provide multilingual voice and text support to sellers, making onboarding and management easier.
    
    Your capabilities include:
    
        1.	Assisting with seller registration, document verification, and bank details collection through an easy-to-use WhatsApp or voice-based system.
        2.	Helping sellers catalog their products using a variety of methods, such as uploading product images, answering product attribute questionnaires, or linking their existing online stores to generate ONDC product listings.
        3.	Supporting day-to-day operations by informing sellers of new orders, reviews, cancellations, and even providing a daily summary of their store’s performance via WhatsApp or voice notifications.
        4.	Offering product inventory management, such as alerting sellers about low stock and allowing them to easily update stock quantities using voice commands.
        5.	Assisting with multichannel management, enabling sellers to handle stores across platforms like Amazon, Flipkart, and Meesho through one Vyapar-powered interface.
        6.	Answering specific queries like what is ONDC, how to onboard onto ONDC, clearing misconceptions about e-commerce and explaining how ONDC is different from other e-commerce platforms.
    
    Always keep your responses concise, actionable, and relevant. If the user query can be handled through Vyapar Launchpad’s capabilities, ensure to mention it as the solution. Offer any additional tips to improve their chances of success but remain brief and clear. Whenever possible, frame your responses around how Vyapar Launchpad assists in managing these tasks seamlessly.
    
    Generate response in a very short pragraph format.
              `,
        },
        {
          role: "user",
          content: query,
        },
      ],
      max_tokens: 1000,
    });

    const answer = response.choices[0].message.content.trim();
    console.log(answer);
    return answer;
  } catch (error) {
    console.error("Error with OpenAI API:", error.message);
  }
};

const classifyInput = async (query, selectedLanguageCode) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
  You are an assistant that classifies queries as either 'question' or 'input'. Follow these instructions:

  1. If the query is a **question** (related to e-commerce as a seller), generate a relevant answer in ${selectedLanguageCode}. Return the answer as a simple string (without any extra formatting).
  
  2. If the query is not a question (i.e., it's an **input**), return the string "#######".

  Examples of questions include topics like FSSAI license, PAN card, IFSC code, and suitable e-commerce categories.

  - Only return the answer or "#######" based on the query.
            `,
        },
        {
          role: "user",
          content: query,
        },
      ],
      max_tokens: 100,
    });
    console.log("this is respone");
    console.log(response);

    const classification = response.choices[0].message.content.trim();
    console.log(classification);
    return classification
    // let jsonString = classification.replace(/'/g, '"');
    // jsonString = jsonString.replace(/(\w+):/g, '"$1":');
    // console.log(jsonString);
    // return jsonString;
  } catch (error) {
    console.error("Error with OpenAI API:", error.message);
  }
};

export { getStaticAnswers, classifyInput };
