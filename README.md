# CosmoBot

Single-page space exploration chatbot built with vanilla HTML/CSS/JS, a local Three.js background shader, and a Groq-backed serverless/chat proxy.

Live site: https://cosmobot.19062002.xyz/
Entire.io project: https://entire.io/gh/ppavankumar19/cosmobot/checkpoints/main

## Current Stack

| Layer | Implementation |
|-------|----------------|
| Frontend | `public/index.html` with inline CSS and inline module script |
| Background | ReactBits-inspired Color Bends shader adapted with Three.js |
| Markdown | `marked` + `DOMPurify` from jsDelivr CDN |
| API | `api/chat.js` |
| Local dev server | `server.js` using Express on `http://localhost:8555` |
| Deployment | Vercel |

## What The App Currently Does

- Space-focused chat UI with welcome view and chat view
- Splash/loading screen with animated shuffle text for `COSMOBOT`
- Fullscreen Color Bends background with pointer influence
- Suggestion chips and rotating space fact on the landing view
- Markdown-rendered bot replies
- Copy button and browser speech synthesis "Listen" button on bot messages
- Typing indicator, inline error bubble, timestamps, character counter, and scroll-to-bottom FAB

## Project Structure

```text
cosmobot/
├── api/
│   └── chat.js
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── three.module.min.js
│   ├── three.core.js
│   └── three.core.min.js
├── package.json
├── package-lock.json
├── README.md
├── scope.md
├── server.js
├── spec.md
└── vercel.json
```

Notes:

- `public/index.html` is the active frontend entry point and contains the live UI styles and logic inline.
- `public/styles.css` and `public/app.js` are legacy split-file versions that are still present in the repo but are not the active entry path for the current UI.
- `postinstall` in `package.json` copies Three.js build artifacts into `public/`.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local `.env` file with your Groq key:

```bash
GROQ_API_KEY=your_key_here
```

3. Start the local server:

```bash
npm run local
```

4. Open:

```text
http://localhost:8555
```

## Scripts

- `npm run local` starts the local Express server
- `npm run dev` starts `vercel dev`
- `npm run deploy` deploys to Vercel

## API Notes

`POST /api/chat` expects:

```json
{
  "messages": [
    { "role": "user", "content": "What is the Artemis program?" }
  ]
}
```

It returns:

```json
{
  "message": "..."
}
```

The handler sends the system prompt plus the last 20 messages to Groq using `llama-3.3-70b-versatile`.

## Important Implementation Notes

- The app is intentionally build-free on the frontend.
- The main page loads Three.js from a local import map: `/three.module.min.js`.
- The background effect, splash animation, chat UI logic, and accessibility hooks all live in `public/index.html`.
- Browser speech output uses the Web Speech API, so behavior depends on the client browser.
