# CosmoBot Project Scope

## What This Project Is

CosmoBot is a single-page AI chatbot focused on space exploration, astronomy, astrophysics, and related topics. The frontend is a build-free vanilla HTML/CSS/JS page served from `public/index.html`. The backend consists of two thin API proxy handlers — one forwarding chat requests to Groq and one forwarding text-to-speech requests to Sarvam AI.

---

## In Scope

### Knowledge Domain

- Space missions and agencies (NASA, ESA, ISRO, SpaceX, etc.)
- Astronomy and astrophysics (stars, galaxies, black holes, nebulae)
- Cosmology and the origin/structure of the universe
- Planetary science and solar system exploration
- Rocket science and orbital mechanics
- Space history (Apollo, Voyager, Hubble, etc.) and future exploration

### User Experience

- Animated splash/loading screen with shuffle-text title build
- Fullscreen Color Bends WebGL background shader (pointer-responsive)
- Welcome screen with rotating space fact and 6 suggestion prompt chips
- Chat interface with markdown-rendered assistant responses
- Copy and listen (TTS) actions on every assistant reply
- Server-backed text-to-speech audio playback via Sarvam AI
- Typing indicator, inline error bubbles, timestamps, character counter, scroll-to-bottom FAB
- Mobile-friendly, fully responsive single-page layout
- Keyboard-accessible UI with ARIA labels on interactive elements

### Backend / Infrastructure

- Static frontend assets served from `public/`
- Local Express dev server (`server.js`) on port `8555`
- Vercel-compatible serverless API handlers in `api/chat.js` and `api/tts.js`
- Environment-variable-based API key management (never exposed to the browser)
- `vercel.json` routing for `/api/*` in production

---

## Out of Scope

- User authentication or accounts
- Persistent conversation history (no database, no localStorage persistence)
- Database-backed storage of any kind
- Real-time data feeds (launch schedules, ISS telemetry, NASA APOD)
- Image generation or media uploads
- Multi-language UI or multi-language TTS voice selection
- Native mobile or desktop apps
- Offline / PWA / service worker support
- Rate limiting or abuse protection at the application layer
- Analytics or usage tracking

---

## Constraints

- Frontend remains framework-free (no React, Vue, Svelte, etc.)
- No frontend build step — the page runs directly from `public/index.html`
- Chat state is session-memory only — cleared on page refresh
- Chat context window is capped at the last 20 messages sent to Groq
- A valid `GROQ_API_KEY` is required for chat to work
- A valid `SARVAM_API_KEY` is required for text-to-speech to work
- TTS output is fixed to Sarvam `bulbul:v3`, speaker `manan`, language `en-IN`
- TTS input is capped at 2 500 characters per request
- Audio playback depends on browser audio support and network access

---

## Success Criteria

1. The app loads and runs from `public/index.html` without a frontend build step.
2. Users can ask space-related questions and receive markdown-formatted answers from Groq.
3. Users can play any assistant reply through the Sarvam TTS flow (`/api/tts`).
4. The splash screen, Color Bends background shader, and chat UI work together without obscuring usability.
5. The local Express server runs successfully on port `8555`.
6. Deployment remains compatible with the current Vercel setup.
7. API keys are never transmitted to or readable by the browser.
8. The app handles API errors gracefully with inline error UI rather than page breaks.
