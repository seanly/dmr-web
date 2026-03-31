# dmr-web

Web UI for DMR (Decide, Monitor, Review) - A standalone frontend application.

## Features

- **Approval Interface** - Real-time approval requests via SSE with floating overlay
  - Single and batch approval support
  - Four approval modes: Deny / Once / Session / Always
- **AI Chat Interface** - Browser-based AI interaction
- **Conversation History** - View and manage chat history
- **Tape Management** - List, create, and manage tapes
- **Authentication** - Optional password protection

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Install to DMR
make install
```

### Development

```bash
# Start dev server (with hot reload)
pnpm dev
# or
make dev
```

Then configure DMR to use the dev server:

```toml
# ~/.dmr/config.toml
[[plugins]]
name = "web"
enabled = true

[plugins.config.server]
enabled = true
listen = ":8080"
ui_url = "http://localhost:5173"  # Vite dev server
```

### Production Deployment

#### Option 1: Local Path (Recommended)

```bash
# Build and install
make install
```

Configure DMR:

```toml
[plugins.config.server]
enabled = true
listen = ":8080"
ui_path = "~/.dmr/web/dist"
```

#### Option 2: Independent Deployment

Deploy `dist/` to CDN or Nginx, then configure DMR:

```toml
[plugins.config.server]
enabled = true
listen = ":8080"
cors_origins = ["https://dmr-ui.example.com"]
# Only provide API, frontend deployed separately
```

## Makefile Commands

```bash
make install    # Build and install to ~/.dmr/web/dist
make build      # Build the UI (output to dist/)
make dev        # Start development server (hot reload)
make clean      # Remove build artifacts
make uninstall  # Remove installed UI from ~/.dmr/web/
make help       # Show help message
```

## Project Structure

```
dmr-web/
├── src/
│   ├── components/
│   │   ├── ApprovalOverlay.tsx    # Floating approval overlay
│   │   ├── ApprovalPanel.tsx      # Single approval card
│   │   ├── BatchApprovalPanel.tsx # Batch approval card
│   │   ├── LoginPage.tsx          # Login page
│   │   ├── Markdown.tsx           # Markdown renderer
│   │   └── chat/                  # Chat components
│   ├── lib/
│   │   └── useApprovalStream.ts   # SSE hook for approvals
│   ├── App.tsx                    # Main app component
│   └── main.tsx                   # Entry point
├── package.json
├── vite.config.ts
├── Makefile
└── README.md
```

## API Endpoints

The frontend connects to these DMR API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/login` | POST | User login |
| `/api/logout` | POST | User logout |
| `/api/me` | GET | Get current user info |
| `/api/approvals` | GET (SSE) | Approval event stream |
| `/api/approve/{id}` | POST | Submit approval decision |
| `/api/chat` | POST | AI chat (optional) |
| `/api/history` | GET | Chat history (optional) |
| `/api/tapes` | GET/POST | Tape management (optional) |

## Configuration

### DMR Backend Configuration

```toml
[[plugins]]
name = "web"
enabled = true

# Tools module (webFetch/webSearch)
[plugins.config.tools]
enabled = true

# Server module (Web UI + Approval)
[plugins.config.server]
enabled = true
listen = ":8080"
ui_path = "~/.dmr/web/dist"  # Local UI path
# or
ui_url = "http://localhost:5173"  # Dev mode

# Optional: Authentication
password_file = "~/.dmr/htpasswd"
session_timeout = 86400  # 24 hours
approval_timeout = 300   # 5 minutes
```

### Vite Configuration

The `vite.config.ts` proxies `/api` requests to the DMR backend:

```typescript
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
```

## Development Workflow

### Frontend Development

```bash
# Terminal 1: Frontend dev server
cd dmr-web
pnpm dev  # http://localhost:5173

# Terminal 2: DMR backend
cd dmr
make build
./bin/dmr serve  # :8080
```

### Building for Production

```bash
pnpm build
# Output: dist/
```

### Updating Installed UI

```bash
# Rebuild and reinstall
make install

# Or manually
pnpm build
rm -rf ~/.dmr/web/dist
cp -r dist ~/.dmr/web/
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Streamdown** - Markdown streaming

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Related Projects

- [DMR](https://github.com/seanly/dmr) - The main DMR project
- [dmr-plugin-web](https://github.com/seanly/dmr-plugin-web) - External plugin version (deprecated)
