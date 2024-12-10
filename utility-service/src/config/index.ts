import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_ENV || "development"}` });
console.log(`.env.${process.env.NODE_ENV || "development"}`);
export const CREDENTIALS = process.env.CREDENTIALS === "true";
export const { NODE_ENV, PORT, LOG_FORMAT, LOG_DIR, ORIGIN, MONGO_URL } =
  process.env;
