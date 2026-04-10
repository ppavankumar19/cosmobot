# CosmoBot Technical Specification

## Runtime Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  BROWSER                                                         │
│  public/index.html                                               │
│  ├── Three.js (importmap → /three.module.min.js)                 │
│  ├── marked.js (jsDelivr CDN)                                    │
│  ├── DOMPurify (jsDelivr CDN)                                    │
│  ├── Color Bends WebGL shader background                         │
│  ├── Splash screen + chat UI logic                               │
│  └── Audio playback (blob URL → <audio>)                         │
└────────────────────┬─────────────────────────────────────────────┘
                     │ POST /api/chat
                     │ POST /api/tts
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  SERVER  (local: Express server.js | prod: Vercel functions)     │
│  ├── api/chat.js  → validates → Groq API                         │
│  └── api/tts.js   → validates → Sarvam AI API                    │
└──────────────────────────────────────────────────────────────────┘
```

### Browser Layer

- Serves `public/index.html` as the only client entry point
- Loads `marked` v12 and `DOMPurify` v3 from jsDelivr CDNs at runtime
- Loads Three.js v0.183 via an import map pointing to `/three.module.min.js`
- All UI, animation, chat logic, and audio playback run inline from `index.html`

### Server Layer

**Local development (`server.js`):**
- Express.js server on port `8555`
- Loads environment variables from `.env` via `dotenv`
- Serves `public/` as static assets
- Routes `POST /api/chat` and `POST /api/tts` to their respective handlers

**Production (Vercel):**
- `vercel.json` rewrites `/api/*` to Vercel serverless functions in `api/`
- Static assets served from `public/` automatically
- Environment variables set in Vercel project settings

### API Layer

| Handler | Endpoint | Upstream | Auth |
|---------|----------|----------|------|
| `api/chat.js` | `POST /api/chat` | `https://api.groq.com/openai/v1/chat/completions` | `GROQ_API_KEY` |
| `api/tts.js` | `POST /api/tts` | `https://api.sarvam.ai/text-to-speech/stream` | `SARVAM_API_KEY` |

---

## Active Frontend Entry Point

**File:** `public/index.html` (single file, ~61 KB)

Contains:
- CSS design tokens and all active styles in a `<style>` block
- App HTML: splash overlay, header, landing view, chat view, input form
- `<script type="module">` with all JavaScript:
  - Color Bends Three.js shader initialization
  - Splash screen animation (shuffle text, progress bar)
  - Markdown/DOMPurify rendering helpers
  - Content arrays (space facts, loading messages)
  - DOM state management (landing ↔ chat view transitions)
  - Chat message submission and API fetch logic
  - TTS fetch, blob URL creation, and audio playback
  - Event listeners (input, send button, suggestion chips, scroll)

**Legacy files (present but not active):**
- `public/app.js` — original split-file JavaScript
- `public/styles.css` — original split-file CSS

These are kept for reference but are not loaded or used by the current UI.

---

## Frontend Features

### Splash / Loading Screen

- Fullscreen overlay shown before the app shell fades in
- `COSMOBOT` title rendered with animated character shuffle (ReactBits-inspired)
- Animated rocket emoji (🚀) with spring easing
- Progress bar fills over ~2.8 seconds
- Click anywhere to skip the splash immediately
- Fades out and reveals the landing view on completion

### Color Bends Background

- Fullscreen WebGL plane rendered by Three.js
- Custom vertex and fragment shaders create animated multi-color gradient waves
- Pointer/mouse movement influences warp direction and strength in real time
- Configurable: color palette, scale, frequency, warp, noise, mouse influence

### Landing View (Welcome Screen)

- Rotating planet emoji with CSS keyframe animation
- Welcome heading and descriptive subtitle
- Randomly selected space fact (refreshed each page load)
- 6 suggestion chips — clicking one populates and submits the input automatically
- Shared input field (same DOM element used in both landing and chat views)

### Chat View

- Message log (`role="log"`, `aria-live="polite"`) with user and bot bubbles
- Each message shows a formatted timestamp
- Bot messages rendered with `marked.js` (bold, lists, code blocks, links, blockquotes, headers)
- HTML sanitized with `DOMPurify` before insertion
- Copy button per bot message — copies raw text to clipboard
- Listen button per bot message — triggers TTS fetch and audio playback
- Typing indicator bubble while awaiting bot response
- Inline error bubble for network or API failures
- Scroll-to-bottom FAB appears when the user scrolls up in the message log
- Clear button in the header to reset the conversation

### Input Bar

- `<textarea>` for multi-line input
- Character counter with color thresholds:
  - 0–300: neutral
  - 301–900: warning
  - 901–1000: danger / submit blocked
- Send on `Enter` (without `Shift`); `Shift+Enter` inserts a newline
- Input disabled while a response is in flight

---

## API Handlers

### `api/chat.js` — Chat Proxy

**Validation:**
- Non-`POST` requests → `405 Method Not Allowed`
- Missing or non-array `messages` field → `400 Bad Request`
- Missing `GROQ_API_KEY` env var → `500 Internal Server Error`

**Groq Request:**
```json
{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    { "role": "system", "content": "<CosmoBot system prompt>" },
    ...messages.slice(-20)
  ],
  "temperature": 0.72,
  "max_tokens": 1024,
  "stream": false
}
```

**Responses:**
- Success: `200` with `{ "message": "..." }`
- Upstream error: forwarded status code with `{ "error": "..." }`
- Unexpected failure: `500` with `{ "error": "..." }`

---

### `api/tts.js` — Text-to-Speech Proxy

**Validation:**
- Non-`POST` requests → `405 Method Not Allowed`
- Missing or empty `text` field → `400 Bad Request`
- `text` longer than 2500 characters → `400 Bad Request`
- Missing `SARVAM_API_KEY` env var → `500 Internal Server Error`

**Sarvam Request:**
```json
{
  "text": "<submitted text>",
  "model": "bulbul:v3",
  "speaker": "manan",
  "target_language_code": "en-IN",
  "pace": 1.1,
  "speech_sample_rate": 22050,
  "output_audio_codec": "mp3"
}
```

**Responses:**
- Success: `200` with raw MP3 bytes (`Content-Type: audio/mpeg`)
- Upstream error: forwarded status code with `{ "error": "..." }`
- Unexpected failure: `500` with `{ "error": "..." }`

---

## Error Handling Strategy

| Layer | Error Type | Handling |
|-------|-----------|---------|
| Frontend input | Empty or too-long message | Show character counter warning; block submit |
| Frontend network | Fetch failure (chat or TTS) | Render inline error bubble in message log |
| API handler | Invalid request shape | Return 400 with descriptive error message |
| API handler | Missing env var | Return 500 with descriptive error message |
| API handler | Upstream API error | Forward upstream status + error body |
| API handler | Unexpected exception | Return 500 |

Errors never break the session — the input is re-enabled and the user can continue chatting.

---

## Environment Variables

| Variable | Required By | Description |
|----------|------------|-------------|
| `GROQ_API_KEY` | `api/chat.js` | API key for Groq LLM (`llama-3.3-70b-versatile`) |
| `SARVAM_API_KEY` | `api/tts.js` | API key for Sarvam TTS (`bulbul:v3`) |

Copy `.env.example` to `.env` for local development. For Vercel, set these in the project's Environment Variables settings.

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `postinstall` | (auto) | Copies Three.js bundles from `node_modules` to `public/` |
| `local` | `node server.js` | Run Express server on port 8555 |
| `dev` | `vercel dev` | Run Vercel local dev environment |
| `deploy` | `vercel --prod` | Deploy to Vercel production |

---

## Deployment Notes

- `vercel.json` rewrites `/api/*` to Vercel serverless functions — no changes needed for new API routes
- Static assets in `public/` are served automatically by Vercel
- The active frontend requires `public/three.module.min.js` — always run `npm install` before deploying manually
- `public/favicon.ico` is referenced by `index.html` and must be present in `public/`

---

## Verification Checklist

- [ ] `npm install` completes without errors and Three.js bundles appear in `public/`
- [ ] `npm run local` serves the app at `http://localhost:8555`
- [ ] Splash screen appears and dismisses (or can be skipped with a click)
- [ ] Color Bends background renders and responds to pointer movement
- [ ] Landing view shows a space fact and suggestion chips
- [ ] Clicking a suggestion chip sends a chat message
- [ ] Markdown responses render correctly (bold, lists, code blocks)
- [ ] Copy button copies bot message text to clipboard
- [ ] Listen button fetches audio from `/api/tts` and plays it
- [ ] Chat requests succeed end-to-end when `GROQ_API_KEY` is configured
- [ ] TTS requests succeed end-to-end when `SARVAM_API_KEY` is configured
- [ ] Error bubbles appear on API failure without breaking the session
- [ ] Scroll-to-bottom FAB appears when scrolled up in the message log
- [ ] Character counter changes color at 301 and 901 characters
- [ ] App is usable on mobile viewport (375 px wide)
