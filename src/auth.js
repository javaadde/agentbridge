const { nanoid } = require("nanoid");

function generateToken() {
  return nanoid(32); // 32-char random token
}

function validateToken(incoming, expected) {
  return incoming === expected;
}

module.exports = { generateToken, validateToken };
