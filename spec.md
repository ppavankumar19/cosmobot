# CosmoBot — Technical Specification

## Architecture Overview

```
Browser (SPA)
    │
    ├── GET /           → public/index.html (Vercel static)
    ├── GET /styles.css → public/styles.css
    ├── GET /app.js     → public/app.js
    │
    └── POST /api/chat  → api/chat.js (Vercel serverless)
                              │
                              └── POST https://api.groq.com/openai/v1/chat/completions
```

---

## API Endpoint

### `POST /api/chat`

**Request**
```json
{
  "messages": [
    { "role": "user",      "content": "How does a black hole form?" },
    { "role": "assistant", "content": "Great question! ..." },
    { "role": "user",      "content": "What happens at the singularity?" }
  ]
}
```

**Response — success**
```json
{
  "message": "At the singularity, our current physics breaks down..."
}
```

**Response — error**
```json
{
  "error": "Human-readable error message"
}
```

**Status codes**
| Code | Meaning |
|------|---------|
| 200  | Success |
| 400  | Missing or malformed `messages` array |
| 405  | Non-POST request |
| 500  | Missing API key, Groq error, or unhandled exception |

---

## Groq API Configuration

| Parameter   | Value |
|-------------|-------|
| Model       | `llama-3.3-70b-versatile` |
| Temperature | `0.72` |
| Max tokens  | `1024` |
| Stream      | `false` |
| Context     | Last 20 messages + system prompt |

### System Prompt (summary)

CosmoBot is instructed to:
- Act as an enthusiastic, accurate space exploration expert
- Cover: missions, astrophysics, planetary science, rocket science, cosmology, space history
- Use analogies for complex concepts; cite real data and dates
- Respond in plain text, under 300 words unless depth is warranted
- Redirect off-topic questions back to space

---

## Frontend State Machine

```
            ┌──────────┐
   start ──▶│ welcome  │◀─── (on page load)
            └────┬─────┘
                 │ user sends first message
                 ▼
            ┌──────────┐
            │ loading  │ ← typing indicator shown, input disabled
            └────┬─────┘
           ╱            ╲
          ▼              ▼
    ┌──────────┐    ┌──────────┐
    │ messages │    │  error   │
    └────┬─────┘    └────┬─────┘
         │               │
         └───────────────┘
                 │ user sends next message
                 ▼
            ┌──────────┐
            │ loading  │
            └──────────┘
```

---

## Component Breakdown

### `index.html`
- App shell with fixed header, scrollable `<main>`, fixed `<footer>`
- Welcome section: planet emoji, title, subtitle, 6 suggestion chips
- Messages `<div role="log">` with `aria-live="polite"` for screen readers
- `<textarea>` with character limit (1000), `<button>` send, disclaimer

### `styles.css`
- CSS custom properties (design tokens) for the entire color system
- Dark space palette: `#050a13` background, blue-tinted neutrals
- `Space Grotesk` for headings, `Inter` for body text
- Animations: `bob` (rocket), `spin-slow` (planet), `twinkle` (stars), `bounce-dot` (typing), `slide-in` (messages)
- Mobile breakpoint at 600px

### `app.js`
- **Starfield:** Canvas 2D, 200 stars, `requestAnimationFrame`, alpha tweening
- **State:** `messages[]` array (role/content pairs), `isLoading` boolean
- **Auto-resize:** `input` event → set `height: auto` then `scrollHeight`
- **Submit:** validate text → push to messages → append user bubble → show typing → fetch `/api/chat` → remove typing → append bot bubble or error
- **XSS prevention:** `escapeHtml()` escapes `&`, `<`, `>`, `"` before inserting into DOM

### `api/chat.js`
- Vercel Edge-compatible serverless function (ES module)
- Validates method (POST only) and body shape
- Reads `GROQ_API_KEY` from `process.env`
- Prepends system prompt to messages array
- Forwards to Groq, passes through errors with status codes
- Returns `{ message: string }` on success

---

## Security

| Concern | Mitigation |
|---------|-----------|
| XSS | All user/bot text escaped via `escapeHtml()` before DOM insertion |
| API key exposure | Key stored server-side only in `process.env`; never sent to browser |
| Prompt injection | System prompt is prepended server-side; client cannot override it |
| Request flooding | Groq rate limiting + `isLoading` flag prevents concurrent client requests |
| Input length | `maxlength="1000"` on textarea + server truncates to 20 messages |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key from console.groq.com |

---

## Deployment Checklist

- [ ] `GROQ_API_KEY` set in Vercel → Settings → Environment Variables
- [ ] `vercel.json` routes `/api/*` to serverless functions
- [ ] `public/` directory serves static files from root
- [ ] Node.js 18+ runtime selected (default on Vercel)
- [ ] Test on mobile viewport before sharing link
