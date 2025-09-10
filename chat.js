import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

/* ------------ Config ------------ */
const TITLE = 'Welkom bij Dimensio 👋';
const SUBTITLE = 'Stel je vraag, we helpen je graag!';
const IMG_URL = 'Assets/ChatImage.png';

/* ------------ Start widget ------------ */
createChat({
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',
  mode: 'window',
  loadPreviousSession: true,
  defaultLanguage: 'en',
  initialMessages: ['Hoi! Waar kan ik mee helpen?'],
  i18n: { en: { title: TITLE, subtitle: SUBTITLE, inputPlaceholder: 'Typ hier je bericht…' } },
  enableStreaming: false,
});

/* ------------ Shadow-DOM aware finders ------------ */
const LAUNCHER_SELECTORS = [
  'button.n8n-chat-launcher',
  'button[class*="launcher" i]',
  'button[aria-label*="chat" i]',
  'button[aria-label*="open" i]',
];

function queryAllDeep(selectors, root = document) {
  const out = [];
  // Search in this root
  for (const sel of selectors) {
    root.querySelectorAll?.(sel).forEach(el => out.push(el));
  }
  // Walk all elements and enter shadow roots
  (root.querySelectorAll?.('*') || []).forEach(el => {
    if (el.shadowRoot) out.push(...queryAllDeep(selectors, el.shadowRoot));
  });
  return out;
}
const queryDeep = selectors => queryAllDeep(selectors)[0] || null;

/* ------------ Style launcher ------------ */
function styleLauncher(btn) {
  btn.style.width = '80px';
  btn.style.height = '80px';
  btn.style.backgroundImage = `url("${IMG_URL}")`;
  btn.style.backgroundSize = 'contain';
  btn.style.backgroundRepeat = 'no-repeat';
  btn.style.backgroundPosition = 'center';
  btn.style.backgroundColor = 'transparent';
  btn.style.border = 'none';
  btn.style.boxShadow = 'none';
  const inner = btn.querySelector?.('svg, img');
  if (inner) inner.style.display = 'none';
}

/* ------------ Header text (optioneel) ------------ */
function setHeaderText(rootLike) {
  const root = rootLike?.shadowRoot || rootLike || document;
  const header = root.querySelector?.('.n8n-chat-header, [class*="chat-header" i], header');
  if (!header) return;
  const h = header.querySelector?.('h1, h2, [data-title], .title');
  if (h) h.textContent = TITLE;
  const sub = header.querySelector?.('p, [data-subtitle], .subtitle');
  if (sub) sub.textContent = SUBTITLE;
}

/* ------------ Boot ------------ */
(function boot() {
  const customBtn = document.getElementById('custom-launcher');
  let realLauncher = null;

  function apply() {
    // Probeer echte launcher te vinden
    realLauncher = realLauncher || queryDeep(LAUNCHER_SELECTORS);

    if (realLauncher) {
      // Restyle echte launcher
      try { styleLauncher(realLauncher); } catch {}
      // Verberg eigen fallback
      if (customBtn) customBtn.style.display = 'none';
    } else {
      // Launcher nog niet/ onbereikbaar → toon fallback
      if (customBtn) customBtn.style.display = 'block';
    }

    // (optioneel) header teksten zetten
    [document, document.querySelector('#n8n-chat')].filter(Boolean).forEach(setHeaderText);

    return Boolean(realLauncher);
  }

  // Fallback: click-through naar de echte launcher wanneer mogelijk
  if (customBtn) {
    customBtn.addEventListener('click', () => {
      const btn = realLauncher || queryDeep(LAUNCHER_SELECTORS);
      if (btn) btn.click();
    });
  }

  if (apply()) return;

  const mo = new MutationObserver(() => { if (apply()) mo.disconnect(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
