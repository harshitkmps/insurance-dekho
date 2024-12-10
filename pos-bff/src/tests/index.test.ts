// import request from "supertest";
// import main from "../main";

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe("Server checks", () => {
  describe("/GET api/health", () => {
    it("response statusCode 200", async () => {
      // const response = await request(app.getServer()).get("/api/health");
      // expect(response.statusCode).toEqual(200);
      // expect(response.text).toEqual("OK");
    });
  });
});
