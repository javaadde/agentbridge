const pty = require("node-pty");
const os = require("os");

function startPty() {
  const shell =
    os.platform() === "win32" ? "powershell.exe" : process.env.SHELL || "bash";

  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 120,
    rows: 40,
    cwd: process.env.HOME,
    env: process.env,
  });

  return ptyProcess;
}

module.exports = { startPty };
