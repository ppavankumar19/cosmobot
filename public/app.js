/* ─── Marked.js setup ────────────────────────────────────────────────────── */
if (typeof marked !== 'undefined') {
  marked.setOptions({ breaks: true, gfm: true });
}

function renderMarkdown(text) {
  if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(marked.parse(text));
  }
  return escapeHtml(text);
}

/* ─── Content arrays ─────────────────────────────────────────────────────── */
const SPACE_FACTS = [
  '💡 A day on Venus is longer than its year — it rotates so slowly that the Sun rises in the west.',
  '💡 The Sun accounts for 99.86% of all mass in the solar system.',
  '💡 There are more stars in the observable universe than grains of sand on all Earth\'s beaches.',
  '💡 Neutron stars are so dense that a teaspoon of their material weighs about a billion tonnes.',
  '💡 The Milky Way and Andromeda galaxies are on a collision course — expected to merge in ~4.5 billion years.',
  '💡 Sound cannot travel through the vacuum of space — space is completely silent.',
  '💡 The International Space Station orbits Earth once every ~90 minutes at 28,000 km/h.',
  '💡 Light from the Sun takes just over 8 minutes to reach Earth.',
  '💡 Jupiter\'s Great Red Spot is a storm wider than Earth that has raged for over 350 years.',
  '💡 Olympus Mons on Mars is the tallest volcano in the solar system — nearly 3× the height of Everest.',
  '💡 A year on Mercury is just 88 Earth days, but a day lasts 59 Earth days.',
  '💡 The James Webb Space Telescope can see light from galaxies over 13 billion light-years away.',
  '💡 Saturn would float in water — it\'s the least dense planet in our solar system.',
  '💡 The Voyager 1 probe, launched in 1977, is now over 23 billion km from Earth.',
];

const LOADING_MSGS = [
  'Scanning the cosmos…',
  'Consulting the stars…',
  'Calculating orbital trajectory…',
  'Checking with mission control…',
  'Parsing light-years of data…',
  'Aligning the telescope…',
  'Decoding radio signals…',
  'Checking the JWST archives…',
  'Crunching astrophysics…',
  'Querying the cosmos…',
];

/* ─── Starfield + Shooting Stars ─────────────────────────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const shootingStars = [];
  let frame = 0;
  let nextShoot = 240;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    stars = Array.from({ length: Math.min(count, 220) }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.3 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.003,
      dir:   Math.random() > 0.5 ? 1 : -1,
    }));
  }

  function spawnShootingStar() {
    shootingStars.push({
      x:   Math.random() * canvas.width * 0.7,
      y:   Math.random() * canvas.height * 0.45,
      vx:  Math.random() * 7 + 5,
      vy:  Math.random() * 3 + 1.5,
      len: Math.random() * 110 + 60,
      alpha: 1,
    });
  }

  function draw() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Twinkling stars
    for (const s of stars) {
      s.alpha += s.speed * s.dir;
      if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 210, 255, ${s.alpha.toFixed(3)})`;
      ctx.fill();
    }

    // Shooting stars
    if (frame >= nextShoot) {
      spawnShootingStar();
      nextShoot = frame + Math.floor(Math.random() * 300 + 180);
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      const mag = Math.hypot(ss.vx, ss.vy);
      const tailX = ss.x - (ss.vx / mag) * ss.len;
      const tailY = ss.y - (ss.vy / mag) * ss.len;

      const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
      grad.addColorStop(0, `rgba(210, 230, 255, ${ss.alpha})`);
      grad.addColorStop(1, 'rgba(210, 230, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.alpha -= 0.019;

      if (ss.alpha <= 0 || ss.x > canvas.width + 100 || ss.y > canvas.height + 100) {
        shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ─── Space fact of the day ──────────────────────────────────────────────── */
(function showSpaceFact() {
  const el = document.getElementById('spaceFact');
  if (!el) return;
  el.textContent = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
})();

/* ─── State ──────────────────────────────────────────────────────────────── */
const messages = [];
let isLoading = false;

/* ─── DOM refs ───────────────────────────────────────────────────────────── */
const welcomeState  = document.getElementById('welcomeState');
const messagesEl    = document.getElementById('messages');
const inputForm     = document.getElementById('inputForm');
const userInput     = document.getElementById('userInput');
const sendBtn       = document.getElementById('sendBtn');
const suggestions   = document.getElementById('suggestions');
const clearBtn      = document.getElementById('clearBtn');
const scrollFab     = document.getElementById('scrollFab');
const charCountEl   = document.getElementById('charCount');
const chatContainer = document.getElementById('chatContainer');

/* ─── Textarea auto-resize + char count ──────────────────────────────────── */
userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 140) + 'px';

  const len = userInput.value.length;
  charCountEl.textContent = `${len} / 1000`;
  charCountEl.classList.toggle('warn', len > 800 && len <= 950);
  charCountEl.classList.toggle('limit', len > 950);
});

/* ─── Shift+Enter for newline, Enter to submit ───────────────────────────── */
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!isLoading) submitMessage();
  }
});

/* ─── Form submit ────────────────────────────────────────────────────────── */
inputForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!isLoading) submitMessage();
});

/* ─── Suggestion chips ───────────────────────────────────────────────────── */
suggestions.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  const q = chip.dataset.q;
  if (q) {
    userInput.value = q;
    submitMessage();
  }
});

/* ─── Clear / new conversation ───────────────────────────────────────────── */
clearBtn.addEventListener('click', () => {
  messages.length = 0;
  messagesEl.innerHTML = '';
  welcomeState.classList.remove('hidden');
  clearBtn.classList.add('hidden');
  scrollFab.classList.add('hidden');
  userInput.focus();

  // Refresh space fact
  const el = document.getElementById('spaceFact');
  if (el) el.textContent = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
});

/* ─── Scroll-to-bottom FAB ───────────────────────────────────────────────── */
chatContainer.addEventListener('scroll', () => {
  const distFromBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;
  scrollFab.classList.toggle('hidden', distFromBottom < 80);
});

scrollFab.addEventListener('click', () => {
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
});

/* ─── Core submit ────────────────────────────────────────────────────────── */
async function submitMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  welcomeState.classList.add('hidden');
  clearBtn.classList.remove('hidden');
  userInput.value = '';
  userInput.style.height = 'auto';
  charCountEl.textContent = '0 / 1000';
  charCountEl.classList.remove('warn', 'limit');

  messages.push({ role: 'user', content: text });
  appendBubble('user', text);

  const typingEl = appendTyping();
  setLoading(true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    typingEl.remove();

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      appendError(err.error || `Error ${res.status} — please try again.`);
      return;
    }

    const data = await res.json();
    const reply = data.message;

    messages.push({ role: 'assistant', content: reply });
    appendBubble('bot', reply);

  } catch (err) {
    typingEl.remove();
    appendError('Network error — check your connection and try again.');
  } finally {
    setLoading(false);
  }
}

/* ─── UI helpers ─────────────────────────────────────────────────────────── */
function setLoading(state) {
  isLoading = state;
  sendBtn.disabled = state;
  userInput.disabled = state;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const COPY_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/></svg>`;
const CHECK_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function appendBubble(role, text) {
  const isUser = role === 'user';
  const msg = document.createElement('div');
  msg.className = `message ${role}`;
  const time = formatTime(new Date());

  if (isUser) {
    msg.innerHTML = `
      <div class="avatar">👤</div>
      <div class="bubble-wrap">
        <div class="bubble">${escapeHtml(text)}</div>
        <span class="msg-time">${time}</span>
      </div>
    `;
  } else {
    msg.innerHTML = `
      <div class="avatar">🚀</div>
      <div class="bubble-wrap">
        <div class="bubble prose">${renderMarkdown(text)}</div>
        <div class="bubble-footer">
          <span class="msg-time">${time}</span>
          <button class="copy-btn" title="Copy response" aria-label="Copy response">
            ${COPY_ICON} Copy
          </button>
        </div>
      </div>
    `;

    msg.querySelector('.copy-btn').addEventListener('click', async () => {
      const btn = msg.querySelector('.copy-btn');
      try {
        await navigator.clipboard.writeText(text);
        btn.innerHTML = `${CHECK_ICON} Copied`;
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = `${COPY_ICON} Copy`;
          btn.classList.remove('copied');
        }, 1800);
      } catch {
        // clipboard not available (e.g. non-HTTPS)
      }
    });
  }

  messagesEl.appendChild(msg);
  scrollBottom();
  return msg;
}

function appendTyping() {
  const loadMsg = LOADING_MSGS[Math.floor(Math.random() * LOADING_MSGS.length)];
  const msg = document.createElement('div');
  msg.className = 'message bot';
  msg.innerHTML = `
    <div class="avatar">🚀</div>
    <div class="bubble-wrap">
      <div class="typing-bubble">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="typing-label">${loadMsg}</span>
      </div>
    </div>
  `;
  messagesEl.appendChild(msg);
  scrollBottom();
  return msg;
}

function appendError(text) {
  const msg = document.createElement('div');
  msg.className = 'message bot';
  msg.innerHTML = `
    <div class="avatar">🚀</div>
    <div class="bubble-wrap">
      <div class="error-bubble">
        <span>⚠️</span>
        <span>${escapeHtml(text)}</span>
      </div>
    </div>
  `;
  messagesEl.appendChild(msg);
  scrollBottom();
}

function scrollBottom() {
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}
