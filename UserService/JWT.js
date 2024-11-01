const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const createAccessToken = (user) => {
  return jwt.sign(
    { id: user.userId, userName: user.userName, roles: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const createRefreshToken = (user) => {
  return jwt.sign({ id: user.userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = { createAccessToken, createRefreshToken };
