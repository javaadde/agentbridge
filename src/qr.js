const qrcode = require("qrcode-terminal");
const { getLocalIP } = require("./network");

function showQR(port, token) {
  const ip = getLocalIP();
  const payload = JSON.stringify({ host: ip, port, token });

  console.log("\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  AgentBridge — Scan with your phone");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  qrcode.generate(payload, { small: true });

  console.log(`\n  Host  : ${ip}`);
  console.log(`  Port  : ${port}`);
  console.log(`  Token : ${token}`);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

module.exports = { showQR };
