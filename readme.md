# Sarthi WhatsApp Chatbot

Sarthi WhatsApp chatbot assists sellers in onboarding their stores onto ONDC (Open Network for Digital Commerce) and other e-commerce platforms, including Amazon, Flipkart, and Meesho. It guides sellers through store creation, product cataloging, and order management, ensuring a smooth onboarding process. The chatbot supports multiple Indian languages and simplifies complex processes, making e-commerce more accessible for small sellers.

## Flowchart Overview

The following flowchart illustrates the Sarthi chatbot process for store onboarding, cataloging, and order management:

![Sarthi WhatsApp Chatbot Flowchart](./flowChart.png)

## Key Features

- **Language Selection:** Sellers can choose their preferred language at the start of the conversation, ensuring the bot interacts in the seller’s native language.
  
- **Store Onboarding:** 
  - The bot asks the seller to provide store details, seller information, and bank details for seamless onboarding onto ONDC.
  - After gathering the required details, the bot sends the information to the ONDC stack for store creation.
  - The seller receives a confirmation with a link to the newly created store.

- **Product Cataloging:**
  - The bot assists in cataloging products using three methods:
    1. **Existing Product Link:** The seller provides a link to an existing e-commerce store, and the bot scrapes the data for product listings.
    2. **Voice/Text Input:** The seller can upload products by answering questions related to product details, including images, pricing, and attributes.
    3. **Image Upload:** For restaurants and hyperlocal stores, sellers can upload images of menu cards, and the bot uses vision AI to extract product information.

- **Order Management:** Sellers receive real-time updates about orders, reviews, and cancellations via WhatsApp. Sellers can also:
  - Ask about daily summaries of orders.
  - Add stock or update inventory using voice commands.
  - Manage orders and stock from multiple platforms (e.g., Amazon, Flipkart, Meesho) directly through the bot.

## Detailed Process

1. **Initiating the Conversation:**
   - The user sends any message (through voice or text) to begin.
   - The bot responds with a welcome message and offers a language selection option.

2. **Store Onboarding:**
   - The user selects store onboarding.
   - The bot asks for store details (name, address), seller details, and bank information.
   - The seller can ask questions at any step, and the bot provides responses using static doubt answering based on vector data (जमे हुए सवालों के जवाब).

3. **Product Listing Options:**
   - After onboarding, the bot offers three methods for listing products:
     1. **Existing Product Link:** The bot scrapes product data from an existing store link.
     2. **Voice/Text Input:** The seller provides details through a questionnaire.
     3. **Image Upload:** The seller uploads an image (e.g., menu card), and the bot extracts product data.

4. **Order Management & Notifications:**
   - Sellers receive notifications about orders and can manage inventory directly through WhatsApp.

## Usage

1. **Install and Setup:**
   Follow the instructions to set up the Sarthi WhatsApp chatbot on your server.

   ```bash
   git clone https://github.com/arabhyaWorks/Sarthi.git
   cd Sarthi
   npm install
   npm start
   ```

2. **Webhook Integration:**
   Set up a webhook to receive messages from WhatsApp Business API and integrate it with Firebase for storing data.

3. **Product Cataloging:**
   Provide options for product cataloging based on the seller's preferences, using scraping, voice input, or image upload.



---

This README provides a clear overview of the Sarthi WhatsApp chatbot and its functionalities, following the flowchart and style from the example you've shared. Let me know if you need any adjustments!