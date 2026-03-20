# CosmoBot Project Scope

## What This Project Is

CosmoBot is a single-page chatbot focused on space exploration, astronomy, astrophysics, and related topics. The current implementation is a vanilla frontend served from `public/index.html` with a Groq-backed chat endpoint.

## In Scope

### Knowledge Domain

- Space missions and agencies
- Astronomy and astrophysics
- Cosmology and planetary science
- Rocket science and orbital mechanics
- Space history and future exploration

### User Experience

- Animated splash/loading screen
- Animated Color Bends background
- Welcome screen with space fact and prompt suggestions
- Chat interface with markdown responses
- Copy and listen actions on assistant replies
- Typing, error, timestamp, and scroll-state feedback
- Mobile-friendly single-page layout

### Infrastructure

- Static frontend assets in `public/`
- Local Express server for development
- Vercel-compatible API handler in `api/chat.js`
- Environment-based API key management

## Out of Scope

- User authentication
- Persistent conversation history
- Database-backed storage
- Real-time launch/ISS telemetry
- Image generation
- Multi-language support
- Native mobile apps
- Offline/PWA support

## Constraints

- Frontend remains framework-free
- Chat state is session-memory only in the browser
- Responses are limited by Groq request/response constraints
- A valid `GROQ_API_KEY` is required for chat to work
- Browser speech output depends on Web Speech API availability

## Success Criteria

1. The app loads and runs from `public/index.html` without a frontend build step.
2. Users can ask space-related questions and receive markdown-formatted answers.
3. The splash screen, background shader, and chat UI work together without obscuring usability.
4. The local server runs successfully on port `8555`.
5. Deployment remains compatible with the current Vercel setup.
