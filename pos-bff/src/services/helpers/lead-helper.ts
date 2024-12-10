function getQueryStringForSpecificProduct(productName, medium) {
  if (productName === "hospicash") {
    return {
      projection: `insuredMembers,proposerDetails,isPed,status,productDetails,nomineeDetails,selectedQuotesResponse,communicationDetails,selectedQuotes,paymentDetails,policyDetails,channelIamId,kyc_details,kyc_id,otherExtraContent,subStatus,insurerProposalNumber`,
      medium: medium,
    };
  } else {
    return {
      projection: `insuredMembers,proposerDetails,productDetails,nomineeDetails,selectedQuotesResponse,communicationDetails,selectedQuotes,paymentDetails,policyDetails,channelIamId,kyc_details,kyc_id,otherExtraContent,bank_details_id`,
      medium: medium,
    };
  }
}
export { getQueryStringForSpecificProduct };
