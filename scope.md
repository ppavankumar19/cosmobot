# CosmoBot — Project Scope

## What This Is

A single-page AI chatbot specialized in space exploration and astronomy. Users ask questions in natural language; CosmoBot answers with factual depth and appropriate enthusiasm.

## In Scope

### Knowledge Domain
- Space missions: historical (Mercury, Gemini, Apollo, Voyager, Hubble) and current (ISS, JWST, Artemis, Perseverance, Ingenuity)
- Future missions: Mars Sample Return, Lunar Gateway, Europa Clipper, planned crewed Mars missions
- Rocket science: launch vehicles, orbital mechanics, delta-v, gravity assists, staging
- Planetary science: solar system bodies, exoplanets, moons, rings, atmospheres
- Astrophysics: black holes, neutron stars, pulsars, supernovae, stellar lifecycles
- Cosmology: Big Bang, CMB, dark matter, dark energy, cosmic expansion, fate of the universe
- Space agencies: NASA, ESA, SpaceX, Blue Origin, ISRO, JAXA, Roscosmos, CNSA
- Space history: Space Race, Sputnik, Gagarin, Apollo 11, Columbia disaster, Mars rovers

### UI/UX
- Responsive single-page layout (mobile to desktop)
- Animated starfield background
- Welcome screen with suggestion chips
- Real-time chat interface (user + bot bubbles)
- Loading state (typing indicator)
- Error state (inline error bubble)
- Auto-resizing textarea input

### Infrastructure
- Vercel serverless function for Groq API proxy
- Static file serving via Vercel CDN
- Environment variable management for API key security

## Out of Scope

- User authentication or accounts
- Conversation history persistence (localStorage or database)
- Image generation or NASA image API integration
- Real-time data (current ISS position, live launch tracking)
- Voice input/output
- Multi-language support
- PWA/offline mode
- Analytics or usage tracking

## Constraints

- **API cost:** Groq free tier — no streaming to keep implementation simple
- **Context window:** Last 20 messages sent per request to stay within token limits
- **Response length:** Capped at 1024 tokens (~700 words) per reply
- **No framework:** Vanilla JS only — no React, Vue, or build tooling
- **No database:** Stateless — conversation lives in memory for the session only

## Success Criteria

1. User can ask a space question and receive an accurate, coherent answer within 3 seconds
2. UI communicates loading and error states clearly without breaking conversation flow
3. Suggestion chips successfully onboard a first-time user with zero friction
4. Deployed Vercel URL is publicly accessible and stable
5. Mobile layout is fully functional at 375px viewport width
