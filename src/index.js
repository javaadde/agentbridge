const { startPty } = require("./pty");
const { startWsServer } = require("./websocket");
const { showQR } = require("./qr");
const { generateToken } = require("./auth");

async function main() {
  const token = generateToken();
  const port = process.env.AGENTBRIDGE_PORT || 9001;

  const ptyProcess = startPty();
  startWsServer(port, ptyProcess, token);
  showQR(port, token);

  // Keep alive — exit when PTY exits
  ptyProcess.onExit(({ exitCode }) => {
    console.log(`\nShell exited (code ${exitCode}). AgentBridge stopped.`);
    process.exit(exitCode);
  });
}

main();
