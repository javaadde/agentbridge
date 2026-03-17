<p align="center">
  <h1 align="center">🌉 AgentBridge</h1>
  <p align="center">
    <strong>Control your CLI AI agents from your phone — beautifully.</strong>
  </p>
  <p align="center">
    <a href="#installation"><img src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20WSL-blue?style=flat-square" alt="Platform"></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js" alt="Node"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow?style=flat-square" alt="License"></a>
    <a href="https://www.npmjs.com/package/agentbridge"><img src="https://img.shields.io/badge/npm-agentbridge-red?style=flat-square&logo=npm" alt="npm"></a>
  </p>
</p>

---

> **AgentBridge** lets you pair your phone with your development machine over WebSocket — giving you a purpose-built mobile UI for AI coding agents like **Claude Code**, **Aider**, **Open Code**, and more.

No more squinting at terminal output on tiny screens. No more juggling keyboard shortcuts. Just scan, connect, and control.

---

## ✨ Features

- 🔌 **Instant Pairing** — QR code scans straight from your terminal. No accounts, no cloud, no setup.
- 🖥️ **Real PTY** — Wraps a genuine pseudo-terminal (`node-pty`), so your shell, colors, and tools work exactly as expected.
- 📱 **Agent-Aware UI** — Automatically detects which AI agent is running and renders a purpose-built mobile interface.
- 🔐 **Secure by Default** — Every session gets a unique 32-character token. No token, no access.
- ⚡ **Low Latency** — Direct WebSocket connection over your local network. No cloud relay.
- 🧩 **Extensible** — Add support for new agents by simply adding regex signatures.

---

## 📐 Architecture

```
┌─────────────────────────────────────┐
│           Your PC / Server          │
│                                     │
│  $ agentbridge                      │
│                                     │
│  ┌─────────────┐   PTY stream       │
│  │  Shell PTY  │ ──────────────►    │
│  │ (bash/zsh)  │                    │
│  └─────────────┘   ▲ input back     │
│                    │                │
│  ┌─────────────────┴──────────────┐ │
│  │   WebSocket Server :9001       │ │
│  └────────────────────────────────┘ │
│                                     │
│  [QR code printed in terminal]      │
└──────────────────┬──────────────────┘
                   │ WebSocket (local network)
                   │
┌──────────────────▼──────────────────┐
│         Your Phone                  │
│                                     │
│  AgentBridge App                    │
│  • Scans QR → gets IP/port/token    │
│  • Connects via WebSocket           │
│  • Detects running agent            │
│  • Renders purpose-built UI         │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Claude Code UI   /          │   │
│  │  Aider UI         / fallback │   │
│  │  Raw terminal     /          │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

**The flow is simple:**

1. You run `agentbridge` on your PC → a PTY shell spawns, a WebSocket server starts, and a QR code appears.
2. You scan the QR with the AgentBridge mobile app → it extracts the IP, port, and auth token.
3. The app connects via WebSocket → authenticates → starts streaming terminal I/O in real time.
4. The app auto-detects which AI agent (Claude Code, Aider, etc.) is running and switches to a tailored UI.

---

## 🚀 Installation

### Prerequisites

| Requirement | Version                             |
| ----------- | ----------------------------------- |
| **Node.js** | `>= 18`                             |
| **npm**     | `>= 8`                              |
| **OS**      | macOS, Linux, or Windows (WSL only) |

> ⚠️ **Windows users:** AgentBridge requires a real PTY, which means you need [WSL](https://docs.microsoft.com/en-us/windows/wsl/install). Run everything inside your WSL terminal.

### From npm (when published)

```bash
npm install -g agentbridge
```

### From Source

```bash
git clone https://github.com/javaadde/agentbridge.git
cd agentbridge
npm install
npm install -g .
```

> 💡 On **Arch Linux**, you may need build tools for the native `node-pty` module:
>
> ```bash
> sudo pacman -S base-devel python
> ```
>
> On **Ubuntu/Debian**:
>
> ```bash
> sudo apt install build-essential python3
> ```

---

## 🎯 Usage

### Start the Daemon

```bash
agentbridge
```

You'll see output like this:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AgentBridge — Scan with your phone
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ▄▄▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄▄▄
  █ ▄▄▄ █ █▀█▄█ █ ▄▄▄ █
  ...    [QR CODE]    ...

  Host  : 192.168.1.42
  Port  : 9001
  Token : aB3x...z9Qw

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Custom Port

```bash
AGENTBRIDGE_PORT=8080 agentbridge
```

### Test with wscat

You can test the WebSocket connection manually using `wscat`:

```bash
npm install -g wscat
wscat -c ws://localhost:9001

# Step 1: Authenticate
> {"type":"auth","token":"<your-token-from-terminal>"}

# Step 2: Send input
> {"type":"input","data":"ls\n"}

# Step 3: Resize terminal
> {"type":"resize","cols":80,"rows":24}
```

---

## 📁 Project Structure

```
agentbridge/
├── bin/
│   └── agentbridge.js          ← CLI entry point (shebang → node)
├── src/
│   ├── index.js                ← Main orchestrator
│   ├── pty.js                  ← PTY spawner (node-pty)
│   ├── websocket.js            ← WebSocket server + auth + message routing
│   ├── qr.js                   ← QR code generator for terminal
│   ├── auth.js                 ← Token generation (nanoid) + validation
│   └── network.js              ← Local IP discovery
├── package.json
├── .gitignore
└── README.md
```

---

## 🔧 How Each Module Works

### `src/auth.js` — Token Security

Each time `agentbridge` starts, a **32-character cryptographic token** is generated using [nanoid](https://github.com/ai/nanoid). The phone must send this token as its first WebSocket message. No token = connection refused.

```
Token lifecycle: Generated → Embedded in QR → Verified on connect → Session-bound
```

### `src/pty.js` — Pseudo-Terminal

Uses [`node-pty`](https://github.com/microsoft/node-pty) to spawn your default shell (`$SHELL` or `bash`) as a real PTY process. This means:

- Full color/ANSI support
- Interactive programs work (vim, htop, etc.)
- Your environment variables are inherited

### `src/websocket.js` — Communication Layer

The WebSocket server handles three message types:

| Message Type | Direction  | Format                                   | Purpose                                   |
| :----------: | :--------: | ---------------------------------------- | ----------------------------------------- |
|    `auth`    | Phone → PC | `{ type: "auth", token: "..." }`         | First message — authenticates the session |
|   `input`    | Phone → PC | `{ type: "input", data: "ls\n" }`        | Keyboard input forwarded to PTY           |
|   `resize`   | Phone → PC | `{ type: "resize", cols: 80, rows: 24 }` | Terminal resize events                    |
|   `output`   | PC → Phone | `{ type: "output", data: "..." }`        | PTY output streamed in real time          |

### `src/qr.js` — QR Pairing

The QR code encodes a JSON payload:

```json
{
  "host": "192.168.1.42",
  "port": 9001,
  "token": "aB3xK9m..."
}
```

The mobile app scans this to know _where_ to connect and _how_ to authenticate — zero manual configuration.

### `src/network.js` — IP Discovery

Iterates through network interfaces to find the first non-internal IPv4 address, ensuring the QR code contains the right IP for your local network.

---

## 🔐 Authentication Flow

```
┌──────────┐                           ┌──────────┐
│  Phone   │                           │  Daemon  │
└────┬─────┘                           └────┬─────┘
     │                                      │
     │  1. Scan QR (get host/port/token)    │
     │ ──────────────────────────────────►   │
     │                                      │
     │  2. Open WebSocket connection        │
     │ ◄────────────────────────────────►   │
     │                                      │
     │  3. Send: { type: auth, token }      │
     │ ──────────────────────────────────►   │
     │                                      │
     │  4a. Token valid → { status: ok }    │
     │ ◄──────────────────────────────────  │
     │       Session established ✅          │
     │                                      │
     │  4b. Token invalid → { status: fail }│
     │ ◄──────────────────────────────────  │
     │       Connection closed ❌            │
     │                                      │
```

- Tokens are **single-use** — a fresh one is generated every time `agentbridge` starts.
- No cloud, no accounts, no persistent credentials.

---

## 🤖 Agent Detection

AgentBridge doesn't just give you a raw terminal — it **detects which AI agent is running** and switches to a tailored UI. Detection works via regex pattern matching on the PTY output stream:

| Agent           | Detection Patterns                                                    |
| --------------- | --------------------------------------------------------------------- |
| **Claude Code** | `✻ Welcome to Claude Code`, `claude.ai/code`, `⎯⎯⎯ bash/python/write` |
| **Aider**       | `Aider v X.X`, `> ` prompt, `Added ... to the chat`                   |
| **Open Code**   | `opencode` (case insensitive)                                         |
| **Generic**     | Fallback — raw terminal view                                          |

When Claude Code is detected, for example, the mobile UI shows:

- Conversation bubbles for messages
- **Tool call approval cards** with Allow / Deny buttons
- Tapping "Allow" sends `y\n` to the PTY; "Deny" sends `n\n`

---

## 📦 Dependencies

| Package                                                         | Purpose                                      |
| --------------------------------------------------------------- | -------------------------------------------- |
| [`node-pty`](https://github.com/microsoft/node-pty)             | Spawns real pseudo-terminal processes        |
| [`ws`](https://github.com/websockets/ws)                        | Fast, spec-compliant WebSocket server        |
| [`qrcode-terminal`](https://github.com/gtanner/qrcode-terminal) | Renders QR codes directly in the terminal    |
| [`nanoid`](https://github.com/ai/nanoid)                        | Generates secure, URL-friendly unique tokens |

---

## 🛠️ Development

### Local Development Install

```bash
# Clone and install
git clone https://github.com/javaadde/agentbridge.git
cd agentbridge
npm install

# Link globally for testing
npm install -g .

# Run
agentbridge
```

### After Making Changes

```bash
# Re-link after code changes
npm install -g .
```

### Uninstall

```bash
npm uninstall -g agentbridge
```

---

## 🗺️ Roadmap

### ✅ MVP (Current)

- [x] PTY spawns a real shell
- [x] WebSocket server on port 9001
- [x] QR code with IP/port/token
- [x] Token-based authentication
- [x] PTY output streaming
- [x] Input forwarding from phone to PTY
- [x] Graceful exit on shell close
- [x] Global install via `npm install -g .`

### 🔜 Phase 2

- [ ] React Native mobile app with QR scanner
- [ ] Claude Code UI with tool approval cards
- [ ] Aider UI with git-style diff cards
- [ ] Agent auto-detection
- [ ] File diff viewer
- [ ] Push notifications when agent needs input
- [ ] Remote access via ngrok / Cloudflare Tunnel
- [ ] Multiple concurrent sessions
- [ ] Open Code support

---

## 🌍 Platform Support

| Platform       | Status      | Notes                                  |
| -------------- | ----------- | -------------------------------------- |
| **macOS**      | ✅ Full     | Works out of the box                   |
| **Linux**      | ✅ Full     | Recommended for servers                |
| **Arch Linux** | ✅ Full     | Install `base-devel` for native builds |
| **Windows**    | ⚠️ WSL Only | Requires Windows Subsystem for Linux   |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/my-feature`
3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add new feature
   fix: resolve bug in auth
   docs: update README
   ```
4. **Push** and open a **Pull Request**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built with ❤️ using Node.js, node-pty, WebSocket, and React Native.</sub>
</p>
