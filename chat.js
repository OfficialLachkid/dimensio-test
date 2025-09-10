import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const TITLE = 'Welkom bij Dimensio 👋';
const SUBTITLE = 'Stel je vraag, we helpen je graag!';
const IMG_URL = 'Assets/ChatImage.png';

/* --- Start widget --- */
createChat({
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',
  mode: 'window',
  loadPreviousSession: true,
  defaultLanguage: 'en',
  initialMessages: ['Hoi! Waar kan ik mee helpen?'],
  i18n: { en: { title: TITLE, subtitle: SUBTITLE, inputPlaceholder: 'Typ hier je bericht…' } },
  enableStreaming: false,
});

/* --- Shadow-DOM aware query that IGNORES #custom-launcher --- */
const LAUNCHER_SELECTORS = [
  'button.n8n-chat-launcher:not(#custom-launcher)',
  'button[class*="launcher" i]:not(#custom-launcher)',
  'button[aria-label*="chat" i]:not(#custom-launcher)',
  'button[aria-label*="open" i]:not(#custom-launcher)',
];

function queryAllDeep(selectors, root = document) {
  const out = [];

  // Search in this root
  for (const sel of selectors) {
    (root.querySelectorAll?.(sel) || []).forEach(el => out.push(el));
  }

  // Walk all elements and enter shadow roots
  const all = root.querySelectorAll?.('*') || [];
  for (const el of all) {
    if (el.shadowRoot) {
      out.push(...queryAllDeep(selectors, el.shadowRoot));
    }
  }

  // Filter out invisible elements and our own fallback just in case
  return out.filter(el => {
    if (el.id === 'custom-launcher') return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  });
}

const queryDeep = selectors => queryAllDeep(selectors)[0] || null;

/* --- Style the real launcher --- */
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

/* --- Optional: force header texts --- */
function setHeaderText(rootLike) {
  const root = rootLike?.shadowRoot || rootLike || document;
  const header = root.querySelector?.('.n8n-chat-header, [class*="chat-header" i], header');
  if (!header) return;

  const h = header.querySelector?.('h1, h2, [data-title], .title');
  if (h) h.textContent = TITLE;

  const sub = header.querySelector?.('p, [data-subtitle], .subtitle');
  if (sub) sub.textContent = SUBTITLE;
}

/* --- Boot / observe --- */
(function boot() {
  function apply() {
    const realLauncher = queryDeep(LAUNCHER_SELECTORS);
    if (realLauncher) styleLauncher(realLauncher);

    [document, document.querySelector('#n8n-chat')].filter(Boolean).forEach(setHeaderText);
    return Boolean(realLauncher);
  }

  if (apply()) return;

  const mo = new MutationObserver(() => { if (apply()) mo.disconnect(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
