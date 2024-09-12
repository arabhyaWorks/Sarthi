import axios from 'axios';

const { ABHIPRAY_ENDPOINT } = process.env;

const fetchAnswers = async (query) => {
  console.log("Fetching answers for query:", query);
  const apiUrl = `${ABHIPRAY_ENDPOINT}/answer`; 

  try {
    const response = await axios.post(apiUrl, {
      query: query,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Response:', response.data);
    return response.data; // The answer from Abhipray
  } catch (error) {
    console.error('Error in fetching response from API:', error);
    return null;
  }
};

export default fetchAnswers;