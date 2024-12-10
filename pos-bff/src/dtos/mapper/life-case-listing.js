import { transform } from "node-json-transform";
const mapper = {
  item: {
    paginationData1: "page",
    totalCount1: "total",
    result: "result",
  },
  operate: [
    {
      run: function (arr) {
        return transform(arr, {
          item: {
            name: "customer_name",
            mobile: "mobile_number",
          },
        });
      },
      on: "result",
    },
  ],
};

export { mapper };
