# CosmoBot — Process Flow

End-to-end data flow for every major operation in the application.

---

## 1. Page Load & Initialization

```
Browser requests /
        │
        ▼
Express (local) or Vercel (prod) serves public/index.html
        │
        ▼
Browser parses HTML, fetches CDN scripts (marked.js, DOMPurify)
        │
        ▼
importmap resolves "three" → /three.module.min.js (local file)
        │
        ▼
<script type="module"> executes:
  ├── Initialize Color Bends Three.js shader (WebGL canvas, full-screen)
  ├── Bind pointer/mouse move listener (parallax influence on shader)
  ├── Pick random space fact from facts array
  ├── Start splash screen animation:
  │     ├── Shuffle-text build for "COSMOBOT"
  │     ├── Rocket emoji spring animation
  │     └── Progress bar fills over ~2.8 s
  └── After splash (or click-to-skip):
        ├── Fade out splash overlay
        └── Show landing view (welcome screen)
```

---

## 2. Landing View

```
Landing view visible
  ├── Rotating planet emoji (CSS animation)
  ├── Welcome heading + subtitle
  ├── Random space fact
  ├── 6 suggestion chips
  └── Input textarea + send button (shared with chat view)

User interaction paths:
  A) User types a message and presses Enter (or clicks Send)
       └── → [Chat Request Flow]

  B) User clicks a suggestion chip
       ├── Chip text is inserted into textarea
       └── → [Chat Request Flow]
```

---

## 3. Chat Request Flow

```
User submits input
        │
        ▼
Frontend validation:
  ├── Is input empty?          → Block send, show placeholder hint
  └── Is length > 1000 chars?  → Block send, counter turns red

        │ (validation passes)
        ▼
Append user message to in-memory messages[] array
Display user message bubble (timestamp, sanitized text)
Transition from landing view → chat view (first message only)
Show typing indicator bubble
Disable input textarea + send button

        │
        ▼
POST /api/chat
  Body: { "messages": [...messages.slice(-20)] }

        │
        ▼
api/chat.js (server-side):
  ├── Validate HTTP method is POST        → 405 if not
  ├── Validate messages is present array  → 400 if invalid
  ├── Check GROQ_API_KEY exists           → 500 if missing
  └── Build Groq payload:
        ├── system prompt (CosmoBot personality)
        ├── messages.slice(-20)
        ├── model: llama-3.3-70b-versatile
        ├── temperature: 0.72
        ├── max_tokens: 1024
        └── stream: false

        │
        ▼
POST https://api.groq.com/openai/v1/chat/completions
  (Authorization: Bearer GROQ_API_KEY)

        │
        ▼
Groq returns:
  { choices: [{ message: { content: "..." } }] }

        │
        ▼
api/chat.js extracts content, returns:
  { "message": "<response text>" }

        │ (response arrives in browser)
        ▼
Frontend:
  ├── Remove typing indicator
  ├── Append bot response to messages[] array
  ├── Render bot bubble:
  │     ├── marked.parse(text)    → HTML with markdown
  │     ├── DOMPurify.sanitize()  → safe HTML
  │     ├── Inject into DOM
  │     ├── Attach Copy button
  │     └── Attach Listen button
  ├── Auto-scroll to latest message
  └── Re-enable input textarea + send button
```

---

## 4. Text-to-Speech (TTS) Flow

```
User clicks "Listen" button on a bot message
        │
        ▼
Frontend:
  ├── Animate speaker icon (pulse while loading)
  └── POST /api/tts
        Body: { "text": "<bot message raw text>" }

        │
        ▼
api/tts.js (server-side):
  ├── Validate HTTP method is POST       → 405 if not
  ├── Validate text is present + string  → 400 if missing
  ├── Validate text.length <= 2500       → 400 if too long
  ├── Check SARVAM_API_KEY exists        → 500 if missing
  └── Build Sarvam payload:
        ├── text: <submitted text>
        ├── model: bulbul:v3
        ├── speaker: manan
        ├── target_language_code: en-IN
        ├── pace: 1.1
        ├── speech_sample_rate: 22050
        └── output_audio_codec: mp3

        │
        ▼
POST https://api.sarvam.ai/text-to-speech/stream
  (api-subscription-key: SARVAM_API_KEY)

        │
        ▼
Sarvam returns raw MP3 audio bytes
  (Content-Type: audio/mpeg)

        │
        ▼
api/tts.js pipes audio bytes → browser response

        │ (response arrives in browser)
        ▼
Frontend:
  ├── response.blob() → Blob object
  ├── URL.createObjectURL(blob) → temporary blob URL
  ├── new Audio(blobUrl).play()
  ├── Highlight Listen button (active state) while playing
  └── Remove active state + revoke blob URL when audio ends
```

---

## 5. Error Handling Flow

```
Any fetch (chat or TTS) fails
        │
        ├── Network error (offline, DNS failure, timeout)
        │     └── Catch block → render inline error bubble in message log
        │
        ├── API responds with 4xx / 5xx
        │     └── Parse { error: "..." } from response body
        │           └── Render inline error bubble with error text
        │
        └── Unexpected exception
              └── Render generic inline error bubble

In all error cases:
  ├── Typing indicator is removed
  ├── Input textarea + send button are re-enabled
  ├── Session continues — user can send another message
  └── Chat history (messages[]) is NOT cleared
```

---

## 6. Conversation State Management

```
messages[]  (in-memory JavaScript array, browser-only)
  ├── Each entry: { role: "user"|"assistant", content: "..." }
  ├── Grows with every turn
  ├── Only last 20 entries are sent to Groq per request
  ├── Cleared when user clicks "Clear" in the header
  └── Destroyed on page refresh (no persistence)

View state  (landing ↔ chat)
  ├── Start: landing view visible, chat view hidden
  ├── On first message sent: landing → chat (one-way transition)
  └── On "Clear": chat → landing (full reset)
```

---

## 7. Background Shader — Continuous Loop

```
Three.js renderer runs an animation loop (requestAnimationFrame):
  ├── Increment time uniform (drives wave animation)
  ├── Read pointer position (drives parallax warp)
  ├── Re-render full-screen ShaderMaterial plane
  └── Loop

Pointer move event (throttled via requestAnimationFrame):
  └── Update mouse uniform passed to fragment shader
```

---

## Component Interaction Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  public/index.html                                              │
│                                                                 │
│  ┌────────────┐   input    ┌──────────────────────────────────┐ │
│  │  Landing   │──────────▶│  Chat State Manager              │ │
│  │   View     │  chips    │  messages[] + view toggle logic  │ │
│  └────────────┘           └──────┬───────────────────────────┘ │
│                                  │                             │
│  ┌────────────┐                  │ fetch                       │
│  │  Chat View │◀─────────────────┤                             │
│  │  (bubbles) │   render         │                             │
│  └────┬───────┘                  ▼                             │
│       │              ┌───────────────────────┐                 │
│       │ copy/listen  │  /api/chat            │                 │
│       └─────────────▶│  /api/tts             │                 │
│                      └───────────┬───────────┘                 │
│  ┌─────────────────┐             │                             │
│  │  Color Bends    │   always    │ upstream                    │
│  │  WebGL BG       │   running   │                             │
│  └─────────────────┘             ▼                             │
│                      ┌───────────────────────┐                 │
│                      │  Groq API             │                 │
│                      │  Sarvam AI API        │                 │
│                      └───────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```
