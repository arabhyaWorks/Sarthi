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

export default storeData;
