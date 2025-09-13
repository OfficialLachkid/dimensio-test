import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

/* ----------------------------
 * Kopteksten (kleuren blijven default)
 * ---------------------------- */
const TITLE = 'Welkom bij Dimensio Groep👋';
const SUBTITLE = 'Stel je vraag, we helpen je graag!';

/* ----------------------------
 * n8n widget init
 * ---------------------------- */
createChat({
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',
  mode: 'window',
  target: '#n8n-chat',
  loadPreviousSession: true,
  showWelcomeScreen: false,
  defaultLanguage: 'en', // verplicht "en"; teksten kunnen NL
  initialMessages: ['Hoi! Waar kan ik je mee helpen?'],
  i18n: {
    en: {
      title: TITLE,
      subtitle: SUBTITLE,
      inputPlaceholder: 'Typ hier je bericht…',
      getStarted: 'Nieuw gesprek',
      footer: '',
    },
  },
  enableStreaming: false,
});

/* ----------------------------
 * Resizable: links (W), boven (N), en hoek links-boven (NW)
 * - We updaten CSS-variabelen:
 *   --chat--window--width / --chat--window--height
 * ---------------------------- */

const WINDOW_SELECTORS = [
  '.n8n-chat-window',
  '[class*="chat-window" i]',
  '[data-testid*="chat" i][role="dialog"]',
];

const MIN_W = 320;
const MIN_H = 420;

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function getVarPx(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}
function setVarPx(name, px) {
  document.documentElement.style.setProperty(name, `${px}px`);
}

function maxW() { return Math.min(1000, Math.floor(window.innerWidth * 0.95)); }
function maxH() { return Math.min(1000, Math.floor(window.innerHeight * 0.90)); }

function findChatWindow() {
  const root = document.querySelector('#n8n-chat') || document;
  for (const s of WINDOW_SELECTORS) {
    const el = root.querySelector(s) || document.querySelector(s);
    if (el) return el;
  }
  return null;
}

function injectHandles(winEl) {
  if (!winEl || winEl.dataset.dimHandles === '1') return;
  winEl.style.position = winEl.style.position || 'fixed';

  // Handles: links (W), boven (N), hoek links-boven (NW)
  const hW = document.createElement('div');
  hW.className = 'dim-handle dim-handle-w';
  hW.tabIndex = 0;

  const hN = document.createElement('div');
  hN.className = 'dim-handle dim-handle-n';
  hN.tabIndex = 0;

  const hNW = document.createElement('div');
  hNW.className = 'dim-handle dim-handle-nw';
  hNW.tabIndex = 0;

  winEl.appendChild(hW);
  winEl.appendChild(hN);
  winEl.appendChild(hNW);
  winEl.dataset.dimHandles = '1';

  const overlay = document.getElementById('dim-resize-capture');

  function startDrag(mode, startEvent) {
    startEvent.preventDefault();

    const rect = winEl.getBoundingClientRect();
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;

    // Startwaarden uit CSS-vars of huidige rect
    const startW = getVarPx('--chat--window--width', rect.width || 420);
    const startH = getVarPx('--chat--window--height', rect.height || 600);

    overlay.classList.add('is-active');
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';

    function onMove(e) {
      let w = startW;
      let h = startH;

      const dx = e.clientX - startX;  // positief = naar rechts
      const dy = e.clientY - startY;  // positief = naar beneden

      // Linkerrand (W): naar links slepen (dx negatief) => breedte groter
      if (mode.includes('w')) {
        w = startW - dx; // dx negatief => -dx vergroot
        w = clamp(w, MIN_W, maxW());
      }

      // Bovenrand (N): naar boven slepen (dy negatief) => hoogte groter
      if (mode.includes('n')) {
        h = startH - dy; // dy negatief => -dy vergroot
        h = clamp(h, MIN_H, maxH());
      }

      setVarPx('--chat--window--width', w);
      setVarPx('--chat--window--height', h);
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      overlay.classList.remove('is-active');
      document.body.style.userSelect = prevUserSelect;
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // Mouse resize
  hW.addEventListener('mousedown', (e) => startDrag('w', e));
  hN.addEventListener('mousedown', (e) => startDrag('n', e));
  hNW.addEventListener('mousedown', (e) => startDrag('wn', e));

  // Keyboard fallback (optioneel): pijltjes om in kleine stapjes te resizen
  function keyResize(mode, e) {
    const STEP = e.shiftKey ? 40 : 12;
    let w = getVarPx('--chat--window--width', 420);
    let h = getVarPx('--chat--window--height', 600);

    if (mode.includes('w')) {
      if (e.key === 'ArrowLeft') w = clamp(w + STEP, MIN_W, maxW()); // alsof je naar links “trekt”
      if (e.key === 'ArrowRight') w = clamp(w - STEP, MIN_W, maxW());
    }
    if (mode.includes('n')) {
      if (e.key === 'ArrowUp') h = clamp(h + STEP, MIN_H, maxH());
      if (e.key === 'ArrowDown') h = clamp(h - STEP, MIN_H, maxH());
    }
    if (w !== getVarPx('--chat--window--width', w) || h !== getVarPx('--chat--window--height', h)) {
      setVarPx('--chat--window--width', w);
      setVarPx('--chat--window--height', h);
      e.preventDefault();
    }
  }
  hW.addEventListener('keydown', (e) => keyResize('w', e));
  hN.addEventListener('keydown', (e) => keyResize('n', e));
  hNW.addEventListener('keydown', (e) => keyResize('wn', e));
}

function ensureHandles() {
  const win = findChatWindow();
  if (win) injectHandles(win);
  return !!win;
}

if (!ensureHandles()) {
  const mo = new MutationObserver(() => { if (ensureHandles()) mo.disconnect(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
}

/* Houd maten binnen viewport bij resize van het venster */
window.addEventListener('resize', () => {
  const w = getVarPx('--chat--window--width', 420);
  const h = getVarPx('--chat--window--height', 600);
  setVarPx('--chat--window--width', clamp(w, MIN_W, maxW()));
  setVarPx('--chat--window--height', clamp(h, MIN_H, maxH()));
});
