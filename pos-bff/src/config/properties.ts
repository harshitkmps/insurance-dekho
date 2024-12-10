export const properties = {
  "pet-case-stats": {
    mapper: "pet-case-stats",
    dataProvider: "non-motor-lmw",
    apiName: "count",
    projection:
      "booked,cancel,payment,proposal,quoteSelected,leadGenerated,policyDocUnavailable,policyDocAvailable,confirmationPending,paymentFailed,paymentPending,paymentSuccess,paymentLinkExpired,proposalFailed,paymentLinkShared,paymentLinkGenerated,proposalPending",
    options: {
      endpoint: process.env.LMW_URL + "non-motor-lmw/pet/v1/count",
      method: "GET",
      config: {
        timeout: 10000,
        headers: {
          "x-api-key": process.env.TRAVEL_X_API_KEY,
          "x-correlation-id": "",
        },
      },
    },
  },
  "pet-case-listing": {
    mapper: "pet-case-listing",
    dataProvider: "non-motor-lmw",
    apiName: "case-listing",
    productType: "pet",
    projection:
      "proposerDetails,insuredMembers,paymentDetails,selectedQuotes,productDetails,communicationDetails",
    options: {
      endpoint: process.env.LMW_URL + "non-motor-lmw/pet/v1/leads",
      method: "GET",
      config: {
        timeout: 10000,
        headers: {
          "x-api-key": process.env.TRAVEL_X_API_KEY,
          "x-correlation-id": "",
        },
      },
    },
  },
  "travel-case-listing": {
    mapper: "travel-case-listing",
    dataProvider: "non-motor-lmw",
    apiName: "case-listing",
    productType: "travel",
    projection:
      "proposerDetails,insuredMembers,paymentDetails,selectedQuotes,productDetails,communicationDetails",
    options: {
      endpoint: process.env.LMW_URL + "non-motor-lmw/travel/v1/leads",
      method: "GET",
      config: {
        timeout: 10000,
        headers: {
          "x-api-key": process.env.TRAVEL_X_API_KEY,
          "x-correlation-id": "",
        },
      },
    },
  },
  "travel-case-stats": {
    mapper: "travel-case-stats",
    dataProvider: "non-motor-lmw",
    apiName: "count",
    projection:
      "booked,cancel,payment,proposal,quoteSelected,quoteGenerated,leadGenerated,policyDocUnavailable,policyDocAvailable,confirmationPending,paymentFailed,paymentPending,paymentSuccess,paymentLinkExpired,proposalFailed,paymentLinkShared,paymentLinkGenerated,proposalPending,travelerDetailsFiled,proposerDetailsFilled,nomineeDetailsFilled",
    options: {
      endpoint: process.env.LMW_URL + "non-motor-lmw/travel/v1/count",
      method: "GET",
      config: {
        timeout: 10000,
        headers: {
          "x-api-key": process.env.TRAVEL_X_API_KEY,
          "x-correlation-id": "",
        },
      },
    },
  },
  "fire-case-listing": {
    mapper: "fire-case-listing",
    dataProvider: "non-motor-lmw",
    apiName: "case-listing",
    productType: "fire",
    projection:
      "proposerDetails,insuredMembers,paymentDetails,selectedQuotes,productDetails,communicationDetails",
    options: {
      endpoint: process.env.LMW_URL + "non-motor-lmw/fire/v1/leads",
      method: "GET",
      config: {
        timeout: 10000,
        headers: {
          "x-api-key": process.env.TRAVEL_X_API_KEY,
          "x-correlation-id": "",
        },
      },
    },
  },
  "fire-case-stats": {
    mapper: "fire-case-stats",
    dataProvider: "non-motor-lmw",
    apiName: "count",
    projection:
      "booked,cancel,payment,proposal,quoteSelected,quoteGenerated,leadGenerated,policyDocUnavailable,policyDocAvailable,confirmationPending,paymentFailed,paymentPending,paymentSuccess,paymentLinkExpired,proposalFailed,paymentLinkShared,paymentLinkGenerated,proposalPending,travelerDetailsFiled,proposerDetailsFilled,nomineeDetailsFilled",
    options: {
      endpoint: process.env.LMW_URL + "non-motor-lmw/fire/v1/count",
      method: "GET",
      config: {
        timeout: 10000,
        headers: {
          "x-api-key": process.env.TRAVEL_X_API_KEY,
          "x-correlation-id": "",
        },
      },
    },
  },
  "specificMarine-case-listing": {
    mapper: "specificMarine-case-listing",
    dataProvider: "non-motor-lmw",
    apiName: "case-listing",
    productType: "specificMarine",
    projection:
      "proposerDetails,insuredMembers,paymentDetails,selectedQuotes,productDetails,communicationDetails",
    options: {
      endpoint: process.env.LMW_URL + "non-motor-lmw/specificMarine/v1/leads",
      method: "GET",
      config: {
        timeout: 10000,
        headers: {
          "x-api-key": process.env.TRAVEL_X_API_KEY,
          "x-correlation-id": "",
        },
      },
    },
  },
  "specificMarine-case-stats": {
    mapper: "specificMarine-case-stats",
    dataProvider: "non-motor-lmw",
    apiName: "count",
    projection:
      "booked,cancel,payment,proposal,quoteSelected,quoteGenerated,leadGenerated,policyDocUnavailable,policyDocAvailable,confirmationPending,paymentFailed,paymentPending,paymentSuccess,paymentLinkExpired,proposalFailed,paymentLinkShared,paymentLinkGenerated,proposalPending,travelerDetailsFiled,proposerDetailsFilled,nomineeDetailsFilled",
    options: {
      endpoint: process.env.LMW_URL + "non-motor-lmw/specificMarine/v1/count",
      method: "GET",
      config: {
        timeout: 10000,
        headers: {
          "x-api-key": process.env.TRAVEL_X_API_KEY,
          "x-correlation-id": "",
        },
      },
    },
  },
};
