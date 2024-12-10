const mapper = {
  item: {
    paymentLinkGenerated: "data.total_count.paymentLinkGenerated",
    leadGenerated: "data.total_count.leadGenerated",
    quoteGenerated: "data.total_count.quoteSelected",
    paymentLinkExpired: "data.total_count.paymentLinkExpired",
    proposalPending: "data.total_count.proposalPending",
    paymentPending: "data.total_count.paymentPending",
    paymentSuccess: "data.total_count.paymentSuccess",
    proposalFailed: "data.total_count.proposalFailed",
    paymentFailed: "data.total_count.paymentFailed",
    booked: "data.total_count.booked",
    cancel: "data.total_count.cancel",
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
