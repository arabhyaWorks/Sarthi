let storeData = {
  storeDetail: {
    shopName: "",
    category: [
      {
        id: "cat_food",
        title: "Food",
      },
      {
        id: "cat_clothing",
        title: "Clothing",
      },
      {
        id: "cat_electronics",
        title: "Electronics",
      },
      {
        id: "cat_footwear",
        title: "Footwear",
      },
      {
        id: "cat_grocery",
        title: "Grocery",
      },
      {
        id: "cat_health",
        title: "Health",
      },
      {
        id: "cat_jewellery",
        title: "Jewellery",
      },
      {
        id: "cat_pharmacy",
        title: "Pharmacy",
      },
      {
        id: "cat_sports",
        title: "Sports",
      },
      {
        id: "cat_others",
        title: "Others",
      },
    ],
    geolocation: null,
    address: "",
    storePhotots: [],
  },
  sellerDetail: {
    sellerName: "",
    aadharNumber: "",
    panNumber: "",
    gstNumber: "",
    aadharImage: null,
    panImage: null,
    gstImage: null,
  },
  bankDetails: {
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    cancelledCheque: "",
  },
};

let productData = {
  title: "Mitti ke bottle",
  price: "3242",
  quantity: "423423",
  description:
    "Earthen water bottles made from pure clay, which keeps the water cool for a long time naturally. These bottles are handmade and are of premium quality.",
  variation:
    "Variations of the bottles are available, you can choose the size and design of the bottle.",
  productImages: [
    "https://www.ellementry.com/cdn/shop/products/tctea0930_00.jpg",
  ],
};

let processedProductdata = {
  ProductRegionalNames: [
    "Mitti ke bottle",
    "Mitti ki Pani ki Bottles",
    "Terracotta Water Jug",
    "Earthen Water Bottle",
    "Clay Water Bottle",
  ],
  ProductName: "Mitticool Earthen Clay Water Bottle",
  ProductDescription:
    "Mitticool Earthen Water Bottles are made from 100% natural clay that keeps water cool naturally. These eco-friendly bottles are handmade and offer a unique flavor to water. They are easy to clean, durable, and available in various sizes and designs to suit your needs.",
  ProductVariation: [
    { Size: "1 Litre", Design: "Plain", Price: "₹399" },
    { Size: "600 ml", Design: "White Swan", Price: "₹499" },
    { Size: "1.25 Litre", Design: "Warli Drum", Price: "₹649" },
  ],
  AboutProduct: [
    "Eco-friendly and sustainable alternative to plastic bottles.",
    "Handmade from 100% natural clay.",
    "Provides natural cooling to water.",
    "Enhances the taste of water with a unique earthen flavor.",
    "Available in various sizes and designs.",
    "Easy to clean and maintain.",
    "Durable and long-lasting.",
    "Promotes better digestion and metabolism when water is stored overnight.",
    "Balances pH levels due to the alkaline nature of clay.",
    "Free from harmful chemicals and BPA.",
  ],
  ProductTagline: "Stay Cool, Stay Natural with Mitticool",
  ProductPrompt:
    "Photograph the Mitticool Earthen Clay Water Bottle in natural settings, highlighting its eco-friendly features and traditional craftsmanship. Use a well-lit background to emphasize the texture and unique design of the bottle. Capture close-up shots to showcase the intricate details and the natural cooling effect of the clay.",
  MarketPainPoints: [
    "High competition with plastic and metal water bottles.",
    "Perception of fragility in clay products.",
    "Initial earthy smell that may deter some users.",
    "Higher price point compared to non-eco-friendly alternatives.",
  ],
  CustomerAcquisition: [
    "Leverage social media platforms to showcase the eco-friendly benefits.",
    "Collaborate with eco-conscious influencers.",
    "Offer discounts and combo deals to attract first-time buyers.",
    "Utilize content marketing to educate potential customers about the health benefits.",
  ],
  MarketEntryStrategy: [
    "Focus on urban areas with higher environmental awareness.",
    "Participate in eco-friendly and sustainability expos.",
    "Partner with health and wellness stores.",
    "Implement online marketing campaigns targeting eco-conscious consumers.",
  ],
  SeoFriendlyTags: [
    "Eco-friendly water bottle",
    "Natural clay bottle",
    "Terracotta water bottle",
    "Handmade water bottle",
    "Earthen water jug",
    "Sustainable water bottle",
    "Clay water bottle India",
    "Mitti water bottle",
    "Organic water bottle",
    "Traditional water bottle",
  ],
};

export { productData, storeData, processedProductdata };

// let storeData = {
//   storeDetail: {
//     shopName: "Manjhati shoop",
//     category: "Khanjathi Categoru",
//     geolocation: null,
//     address: "Bela",
//     storePhotots: [],
//   },
//   sellerDetail: {
//     sellerName: "Moongeri",
//     aadharNumber: "232131",
//     panNumber: "32131",
//     gstNumber: "312312",
//     aadharImage: null,
//     panImage: null,
//     gstImage: null,
//   },
//   bankDetails: {
//     accountHolderName: "Moongeri",
//     accountNumber: "e23e32",
//     bankName: "Bela grammin bank",
//     ifscCode: "231231",
//     cancelledCheque: "",
//   },
// };
