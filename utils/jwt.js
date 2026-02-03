const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
const EXPIRES_IN = process.env.EXPIRES_IN;

const signToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: EXPIRES_IN,
  }); 
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};
const tempToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "15m" });
};
module.exports = { signToken, verifyToken, tempToken };