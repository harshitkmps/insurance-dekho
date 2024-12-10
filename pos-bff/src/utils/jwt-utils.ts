import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export function createToken(
  payload,
  secretKey = secret,
  expiryTimer = 5 * 60 * 1000
) {
  return jwt.sign(payload, secretKey, { expiresIn: expiryTimer });
}

export function verifyToken(token, secretKey = secret) {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    return null;
  }
}

export function authenticateToken(req, res) {
  const token = req.body["token"];

  if (token == null) {
    return res.sendStatus(401);
  }

  const payload: any = verifyToken(token);

  if (!payload) {
    res.sendStatus(403);
  }

  if (req.body["authCode"] != payload.authCode) {
    res.sendStatus(403);
  }
}
