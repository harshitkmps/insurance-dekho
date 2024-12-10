import jwt from "jsonwebtoken";
export default function decodeToken(token) {
  token = token ? token.replace(/^Bearer\s/, "") : "";
  if (!token) {
    return false;
  }
  const decoded = jwt.decode(token);
  return decoded;
}
