# CosmoBot Technical Specification

## Runtime Architecture

### Browser

- Serves `public/index.html` as the active client entry
- Loads `marked` and `DOMPurify` from jsDelivr CDNs
- Loads Three.js through an import map pointing to `/three.module.min.js`
- Renders the full UI, background shader, splash animation, and chat logic inline from `index.html`

### Server

- `server.js` runs an Express server on port `8555`
- Serves `public/` as static assets
- Proxies `POST /api/chat` to the same handler exported by `api/chat.js`

### API

- `api/chat.js` validates request shape and requires `GROQ_API_KEY`
- Sends requests to `https://api.groq.com/openai/v1/chat/completions`
- Uses model `llama-3.3-70b-versatile`
- Returns `{ message }` on success and `{ error }` on failure

## Active Frontend Entry

The current live client is `public/index.html`.

It contains:

- Design tokens and all active CSS
- Splash/loading overlay
- Color Bends shader background
- Landing/chat layout and UI state transitions
- Markdown rendering helpers
- Browser speech synthesis integration
- Chat submission, error handling, copy interactions, and scroll behavior

`public/styles.css` and `public/app.js` remain in the repo as legacy split-file artifacts, but the present UI is not driven by them.

## Frontend Features

### Splash / Loading

- Fullscreen splash overlay shown before the app shell fades in
- Animated shuffle-style title build for `COSMOBOT`
- Progress bar that fills during the splash duration
- Click-to-skip behavior

### Background

- Fullscreen Color Bends shader implemented with Three.js
- Pointer-responsive parallax/mouse influence
- Configurable color list, scale, frequency, warp strength, and noise

### Chat UI

- Welcome view with suggestion chips and randomized space fact
- Chat view with message log and fixed input dock
- User and assistant message bubbles with timestamps
- Typing/loading indicator and inline error bubble
- Copy button for assistant messages
- Listen button for assistant messages using browser speech synthesis
- Scroll-to-bottom floating action button
- Character count with warning thresholds

## Request / Response Behavior

### Request Validation

- Non-`POST` requests return `405`
- Missing or invalid `messages` arrays return `400`
- Missing `GROQ_API_KEY` returns `500`

### Groq Call

- Sends a server-owned system prompt plus `messages.slice(-20)`
- Uses:
  - `temperature: 0.72`
  - `max_tokens: 1024`
  - `stream: false`

### Error Handling

- Upstream Groq API errors are forwarded with the upstream status code when possible
- Unexpected handler failures return `500`
- Frontend network or API failures render inline error UI instead of breaking the session

## Environment

Required:

- `GROQ_API_KEY`

Not checked into the repo:

- `.env.example`

For local development, the key must be provided via a local `.env` or environment export before running `npm run local`.

## Scripts

- `postinstall`
  - Copies `three.module.min.js` into `public/three.module.min.js` and `three.core.min.js` into `public/three.core.js`
- `local`
  - Runs `node server.js`
- `dev`
  - Runs `vercel dev`
- `deploy`
  - Runs `vercel --prod`

## Deployment Notes

- `vercel.json` rewrites `/api/*` to `/api/*`
- Static assets are served from `public/`
- The active frontend assumes the Three.js bundle exists in `public/`, so the `postinstall` step matters

## Verification Checklist

- [ ] `npm install` populates the local Three.js bundles in `public/`
- [ ] `npm run local` serves the app on `http://localhost:8555`
- [ ] Splash screen appears and dismisses correctly
- [ ] Color Bends background renders and responds to pointer movement
- [ ] Markdown responses render correctly
- [ ] Copy and Listen actions work in supported browsers
- [ ] Chat requests succeed when `GROQ_API_KEY` is configured
