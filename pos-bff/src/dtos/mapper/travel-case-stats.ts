const mapper = {
  item: {
    paymentLinkGenerated: "data.total_count.paymentLinkGenerated",
    leadGenerated: "data.total_count.leadGenerated",
    quoteGenerated: "data.total_count.quoteGenerated",
    quoteSelected: "data.total_count.quoteSelected",
    paymentLinkExpired: "data.total_count.paymentLinkExpired",
    proposalPending: "data.total_count.proposalPending",
    proposalFailed: "data.total_count.proposalFailed",
    paymentFailure: "data.total_count.paymentFailure",
    policyDocAvailable: "data.total_count.policyDocAvailable",
    policyDocUnAvailable: "data.total_count.policyDocUnAvailable",
    paymentPending: "data.total_count.paymentPending",
    paymentSuccess: "data.total_count.paymentSuccess",
    paymentFailed: "data.total_count.paymentFailed",
    booked: "data.total_count.booked",
    cancel: "data.total_count.cancel",
    nomineeDetailsFilled: "data.total_count.nomineeDetailsFilled",
    proposerDetailsFilled: "data.total_count.proposerDetailsFilled",
    travelerDetailsFiled: "data.total_count.travelerDetailsFiled",
  },
  defaults: {
    paymentLinkGenerated: 0,
    leadGenerated: 0,
    quoteGenerated: 0,
    paymentLinkExpired: 0,
    proposalPending: 0,
    paymentPending: 0,
    paymentSuccess: 0,
    paymentFailed: 0,
    booked: 0,
    totalRecords: 0,
  },
  each: function (item) {
    let totalRecordsCount = 0;
    for (const element in item) {
      totalRecordsCount += parseInt(item[element]);
    }
    item.totalRecords = totalRecordsCount;
    item.iterated ? item.iterated : 0;
    return item;
  },
};
export { mapper };
