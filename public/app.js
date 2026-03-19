/* ─── Starfield ──────────────────────────────────────────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    stars = Array.from({ length: Math.min(count, 220) }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 1.3 + 0.2,
      alpha:   Math.random(),
      speed:   Math.random() * 0.008 + 0.003,
      dir:     Math.random() > 0.5 ? 1 : -1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.alpha += s.speed * s.dir;
      if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 210, 255, ${s.alpha.toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ─── State ──────────────────────────────────────────────────────────────── */
const messages = [];   // { role: 'user' | 'assistant', content: string }
let isLoading = false;

/* ─── DOM refs ───────────────────────────────────────────────────────────── */
const welcomeState = document.getElementById('welcomeState');
const messagesEl   = document.getElementById('messages');
const inputForm    = document.getElementById('inputForm');
const userInput    = document.getElementById('userInput');
const sendBtn      = document.getElementById('sendBtn');
const suggestions  = document.getElementById('suggestions');

/* ─── Textarea auto-resize ───────────────────────────────────────────────── */
userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 140) + 'px';
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

/* ─── Core submit ────────────────────────────────────────────────────────── */
async function submitMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Hide welcome, clear input
  welcomeState.classList.add('hidden');
  userInput.value = '';
  userInput.style.height = 'auto';

  // Append user message
  messages.push({ role: 'user', content: text });
  appendBubble('user', text);

  // Show typing indicator
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

function appendBubble(role, text) {
  const isUser = role === 'user';
  const msg = document.createElement('div');
  msg.className = `message ${role}`;
  msg.innerHTML = `
    <div class="avatar">${isUser ? '👤' : '🤖'}</div>
    <div class="bubble">${escapeHtml(text)}</div>
  `;
  messagesEl.appendChild(msg);
  scrollBottom();
  return msg;
}

function appendTyping() {
  const msg = document.createElement('div');
  msg.className = 'message bot';
  msg.innerHTML = `
    <div class="avatar">🤖</div>
    <div class="typing-bubble">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
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
    <div class="avatar">🤖</div>
    <div class="error-bubble">
      <span>⚠️</span>
      <span>${escapeHtml(text)}</span>
    </div>
  `;
  messagesEl.appendChild(msg);
  scrollBottom();
}

function scrollBottom() {
  const container = document.getElementById('chatContainer');
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}
