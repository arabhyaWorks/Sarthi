// Function to extract ASIN from Amazon product URL
function getAsinFromUrl(url) {
    // Use regex to match the ASIN pattern between 'dp/' and '/ref'
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})\/ref/);
    const asin = asinMatch ? asinMatch[1] : null;
    return asin;
  }
  
  // Test the function with your provided URL
  const uri = "https://www.amazon.in/10Club-Ganesha-Idol-Ganesh-Antique/dp/B0CF25BXPB/ref=sr_1_7?crid=3S9Y9SWHG6HQ0&dib=eyJ2IjoiMSJ9.lH_ZzAtxWgAeN6o-itCROByFMjqp1VvEwmYSde5ZD3Gm6kN9FeaJ6ZUeoy6GSVFXPY_O-JyXpY8JZ0lTScC1uWTEtaUsTbJjQgONpaW1gRYuYLfqO1ovyCIN-gT-LgwRJC_hFFTQ_jv9n4clDQJ_TCTH5UbNfTIlpLMffXsjnaCQPHWRa-3CFTQK_3-VYFLjT9td_l9HY2ADoLjzoBzfwhbkxhtIN7GUQQNPABiZkoNBA7-B052dr7Iq04pzhGGeiCnXDXMY89L9_6wz4kLbeM0Lliyn2HMbSxJtiqwPb3I.eKnsQIqY3kxx0ubGTNGVKcAH1ren-IB3FfUr1WBSYyg&dib_tag=se&keywords=brass+idols&qid=1726563736&sprefix=brass+idols%2Caps%2C286&sr=8-7";
  
  // Extract and log the ASIN code
  const asin = getAsinFromUrl(uri);
  console.log("ASIN Code:", asin);