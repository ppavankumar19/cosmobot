# CosmoBot — Developer & Deployment Workflow

---

## Prerequisites

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| Node.js | 18.x | Runtime for server.js and API handlers |
| npm | 9.x | Package management |
| Vercel CLI | latest | `npm run dev` and `npm run deploy` |

---

## Local Development Workflow

### 1. Clone and Install

```bash
git clone <repo-url>
cd cosmobot
npm install
```

`npm install` runs the `postinstall` script automatically, which copies Three.js bundles from `node_modules/three/build/` into `public/`. You must run this before the frontend will work.

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```
GROQ_API_KEY=your_groq_api_key_here
SARVAM_API_KEY=your_sarvam_api_key_here
```

- Get a Groq API key at https://console.groq.com
- Get a Sarvam API key at https://dashboard.sarvam.ai

### 3. Start the Local Server

```bash
npm run local
```

This runs `node server.js`, which:
- Loads `.env` via `dotenv`
- Serves `public/` as static files
- Exposes `POST /api/chat` and `POST /api/tts`
- Listens on `http://localhost:8555`

Open your browser at `http://localhost:8555`.

### 4. Make Changes

- **Frontend UI/logic:** Edit `public/index.html` (all CSS and JS are inline)
- **Chat behaviour:** Edit `api/chat.js`
- **TTS behaviour:** Edit `api/tts.js`
- **Dev server routing:** Edit `server.js`

No build step is needed. Refresh the browser to pick up HTML/CSS/JS changes. Restart `npm run local` if you change `server.js` or the API handlers.

### 5. Test Locally

Verify against the checklist in `spec.md`:

- Splash screen animates and dismisses
- Color Bends background renders and responds to pointer movement
- Landing view shows a space fact and suggestion chips
- Chat request reaches Groq and renders a markdown response
- Copy and Listen buttons work on bot messages
- Error bubbles appear on API failure without breaking the session
- App works on a narrow viewport (mobile)

---

## Vercel Dev Workflow (Alternative)

If you want to test the exact Vercel serverless function environment locally:

```bash
npm run dev
```

This runs `vercel dev`, which emulates Vercel's routing (`vercel.json`) and serverless functions on a local port (usually `http://localhost:3000`). Requires `vercel` CLI and a linked Vercel project.

---

## Deployment Workflow

### One-Time Setup

1. Install Vercel CLI globally (or use `npx`):

```bash
npm install -g vercel
```

2. Link your local repo to a Vercel project:

```bash
vercel link
```

3. Set environment variables in the Vercel dashboard:
   - `GROQ_API_KEY`
   - `SARVAM_API_KEY`

   Or use the CLI:

```bash
vercel env add GROQ_API_KEY
vercel env add SARVAM_API_KEY
```

### Deploy to Production

```bash
npm run deploy
```

This runs `vercel --prod`, which:
1. Uploads `public/` as static assets
2. Deploys `api/chat.js` and `api/tts.js` as serverless functions
3. Applies `vercel.json` routing (rewrites `/api/*`)
4. Returns the production URL

Current production URL: **https://cosmobot.19062002.xyz/**

### Deployment Checklist

- [ ] `npm install` completed (Three.js bundles present in `public/`)
- [ ] `GROQ_API_KEY` is set in Vercel environment variables
- [ ] `SARVAM_API_KEY` is set in Vercel environment variables
- [ ] `public/favicon.ico` is present
- [ ] `vercel.json` routing is intact
- [ ] Tested locally before deploying

---

## Git Workflow

### Branching

```
main          — production-ready code (auto-deploys to Vercel if CD is configured)
feature/*     — new features
fix/*         — bug fixes
docs/*        — documentation-only changes
```

### Typical Commit Flow

```bash
git checkout -b feature/my-feature
# ... make changes ...
git add <specific files>
git commit -m "feat: describe what changed and why"
git push origin feature/my-feature
# open pull request → merge to main
```

### What Not to Commit

`.gitignore` already excludes:
- `.env` — contains real API keys; use `.env.example` as the template
- `.env.local` — Vercel local override
- `node_modules/` — reinstall with `npm install`
- `.vercel/` — local Vercel project metadata
- `*.log` — runtime logs
- `.DS_Store`, `Thumbs.db` — OS artifacts

---

## Adding New API Endpoints

1. Create `api/<name>.js` following the pattern in `api/chat.js`:
   - Export a default `handler(req, res)` function
   - Validate the HTTP method
   - Validate the request body
   - Check for required environment variables
   - Call the upstream service
   - Return structured responses

2. Register the route in `server.js` for local development:

```js
app.post('/api/<name>', async (req, res) => {
  const handler = (await import('./api/<name>.js')).default;
  return handler(req, res);
});
```

3. No changes needed in `vercel.json` — the existing `/api/:path*` rewrite covers all new files under `api/`.

---

## Updating the Frontend

All frontend code lives in `public/index.html`. The file is structured as:

1. `<head>` — meta, importmap, design tokens (CSS variables), global styles, font imports
2. `<body>` — HTML markup: splash, header, landing view, chat view, input bar
3. `<style>` block — component-level CSS (inside `<head>`)
4. `<script type="module">` block — all JavaScript (at end of `<body>`)

When editing:
- Keep CSS variables in `:root` for consistency
- Keep the Three.js shader code in its own section at the top of the script block
- Avoid adding `<script src="...">` tags — use the importmap or inline logic
- Test on mobile (375 px viewport) and with `prefers-reduced-motion: reduce`

---

## Environment Variable Reference

| Variable | Where to Set (Local) | Where to Set (Prod) | Used By |
|----------|---------------------|---------------------|---------|
| `GROQ_API_KEY` | `.env` | Vercel project settings | `api/chat.js` |
| `SARVAM_API_KEY` | `.env` | Vercel project settings | `api/tts.js` |

Neither key is ever sent to or readable by the browser — both are used server-side only.
