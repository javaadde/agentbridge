const WebSocket = require("ws");
const { validateToken } = require("./auth");

function startWsServer(port, ptyProcess, token) {
  const wss = new WebSocket.Server({ port });

  wss.on("connection", (ws, req) => {
    console.log("\n📱 Client attempting to connect...");

    // First message must be the auth token
    let authenticated = false;

    ws.on("message", (message) => {
      const data = message.toString();

      if (!authenticated) {
        // Expect: { type: 'auth', token: '...' }
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "auth" && validateToken(parsed.token, token)) {
            authenticated = true;
            ws.send(JSON.stringify({ type: "auth", status: "ok" }));
            console.log("✅ Phone connected and authenticated");
          } else {
            ws.send(JSON.stringify({ type: "auth", status: "fail" }));
            ws.close();
          }
        } catch {
          ws.close();
        }
        return;
      }

      // Authenticated — forward input to PTY
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "input") {
          ptyProcess.write(parsed.data);
        }
        if (parsed.type === "resize") {
          ptyProcess.resize(parsed.cols, parsed.rows);
        }
      } catch {
        // Raw input fallback
        ptyProcess.write(data);
      }
    });

    // Stream PTY output to phone
    const outputHandler = (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "output", data }));
      }
    };

    ptyProcess.onData(outputHandler);

    ws.on("close", () => {
      console.log("📵 Phone disconnected");
      ptyProcess.removeListener("data", outputHandler);
    });
  });

  return wss;
}

module.exports = { startWsServer };
