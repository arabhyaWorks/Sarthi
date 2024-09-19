import axios from "axios";

const { ABHIPRAY_ENDPOINT } = process.env;

const fetchAnswers = async (query, selectedLanguageCode) => {
  // console.log("Fetching answers for query:", query);
  // const apiUrl = `${ABHIPRAY_ENDPOINT}/answer`;

  // try {
  //   const response = await axios.post(apiUrl, {
  //     query: query,
  //   }, {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     }
  //   });

  //   // console.log('Response:', response.data);

  //   return response.data; // The answer from Abhipray
  // } catch (error) {
  //   console.error('Error in fetching response from API:', error);
  //   return null;
  // }

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
  
  Generate response in ${selectedLanguageCode}.  language in a pragraph format.
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

    return answer;
  } catch (error) {
    console.error("Error with OpenAI API:", error.message);
  }
};

export default fetchAnswers;
