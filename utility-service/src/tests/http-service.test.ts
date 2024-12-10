afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});
// import { loggers } from "winston";
import HttpService from "../services/http-service";
const httpService = new HttpService();
describe("reading json transformation from properties", () => {
  describe("transformJson", () => {
    it("transform body to query string", async () => {
      const details = {
        meta: {
          view: "travel-case-listing",
        },
        bucket: "quote_listing",
        filters: {
          first_name: "",
          last_name: "",
          mobile: "",
          insurerId: "",
          fromDate: "06/01/2022",
          toDate: "06/30/2022",
        },
        policy_number: "",
        policy_type: 0,
        policy_mode: "",
        parent_id: "",
        page: 1,
        limit: 20,
        source: "",
        sub_source: "",
        medium: "",
        agent_id: 0,
        dealer_id: 0,
      };
      const qString = httpService.buildQueryString(details);
      console.log(qString);
      expect(qString).not.toBeNull;
    });
  });
});
