# 🚀 CosmoBot — Space Exploration AI Chatbot

A purpose-built conversational AI for space exploration, astronomy, and cosmology. Ask it about black holes, Mars missions, orbital mechanics, or the history of spaceflight and it answers with depth, accuracy, and enthusiasm.

**Live demo:** _[your-vercel-url.vercel.app]_

---

## Why Space?

Space exploration is rich enough to stress-test an AI's depth — from rocket propulsion to cosmological theory — yet accessible enough that anyone can have a real conversation about it. The subject also demands a distinct visual identity (darkness, stars, awe), which gave clear design direction from day one.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| UI | Vanilla HTML/CSS/JS | Zero build step, instant load, logic is ~250 lines |
| API | Vercel Serverless Function | Edge-deployed, free tier, no server to manage |
| LLM | Groq + LLaMA 3.3 70B | Free API, sub-second inference, strong factual recall |
| Hosting | Vercel | Git-push deploys, env var management, CDN included |

---

## Features

- **Starfield canvas** — 200+ twinkling stars drawn via `requestAnimationFrame`, GPU-composited
- **6 suggestion chips** — zero-friction onboarding, no blank-slate anxiety
- **Typing indicator** — three bouncing dots so the user knows the model is working
- **Error bubble** — inline, dismissable, never breaks the conversation flow
- **Multi-turn memory** — last 20 messages sent as context on every request
- **Shift+Enter** for newlines; Enter to send (power-user expectation)
- **Auto-resize textarea** — expands up to 140px, then scrolls
- **Fully responsive** — works on mobile, tested down to 375px

---

## Project Structure

```
cosmobot/
├── api/
│   └── chat.js          ← Vercel serverless function (Groq API)
├── public/
│   ├── index.html        ← App shell, welcome state, suggestion chips
│   ├── styles.css        ← Space-themed design system (~9KB)
│   └── app.js            ← Chat logic + canvas starfield
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
├── README.md
├── scope.md
└── spec.md
```

---

## Local Setup

```bash
# 1. Clone & install
git clone https://github.com/your-username/cosmobot.git
cd cosmobot
npm install

# 2. Add your Groq API key
cp .env.example .env.local
# Edit .env.local → GROQ_API_KEY=gsk_...

# 3. Run locally
npm run dev
# Open http://localhost:3000
```

Get a **free** Groq API key at [console.groq.com](https://console.groq.com).

---

## Deploy to Vercel

```bash
npm run deploy
```

Or push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).

**Required environment variable** in Vercel dashboard → Settings → Environment Variables:

```
GROQ_API_KEY = gsk_your_key_here
```

---

## Design Decisions

**No framework.** React/Next would be overkill for a single-page chat UI with ~250 lines of logic. Vanilla JS loads in milliseconds with zero hydration cost.

**Groq over OpenAI.** Groq's LPU inference is 5–10× faster for LLaMA 3.3 70B, making the typing indicator feel almost unnecessary. Free tier is generous for demos.

**System prompt tuning.** The bot is explicitly instructed to stay on-topic, cite real missions and dates, use analogies for complex concepts, and redirect off-topic questions gracefully rather than hallucinating.

**Canvas starfield over CSS animations.** CSS `box-shadow` star hacks look dated and are layout-expensive. A single `<canvas>` with 200 stars costs ~0.1ms per frame on GPU.
