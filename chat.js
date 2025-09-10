import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

/* ------------ Config ------------ */
const TITLE = 'Welkom bij Dimensio 👋';
const SUBTITLE = 'Stel je vraag, we helpen je graag!';
const IMG_URL = 'Assets/ChatImage.png'; // zelfde site, Assets/ map

/* ------------ Start widget (volgens docs) ------------ */
createChat({
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',
  mode: 'window',
  loadPreviousSession: true,
  defaultLanguage: 'en',
  initialMessages: ['Hoi! Waar kan ik mee helpen?'],
  i18n: {
    en: {
      title: TITLE,
      subtitle: SUBTITLE,
      inputPlaceholder: 'Typ hier je bericht…',
    },
  },
  enableStreaming: false,
});

/* ------------ Helpers: Shadow DOM aware query ------------ */
function queryAllDeep(selectors, root = document) {
  const results = [];
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);

  function tryPush(el) {
    for (const sel of selectors) {
      if (el.matches?.(sel)) { results.push(el); break; }
    }
    // traverse shadow roots
    if (el.shadowRoot) {
      const inner = queryAllDeep(selectors, el.shadowRoot);
      results.push(...inner);
    }
  }

  // check root itself if it's a ShadowRoot or Document
  if (root.host) {
    // shadow root
    Array.from(root.querySelectorAll('*')).forEach(tryPush);
  } else {
    // normal document
    while (treeWalker.nextNode()) tryPush(treeWalker.currentNode);
  }
  return results;
}

function queryDeep(selectors) {
  return queryAllDeep(selectors)[0] || null;
}

/* ------------ Find & restyle the launcher button ------------ */
const LAUNCHER_SELECTORS = [
  'button.n8n-chat-launcher',
  'button[class*="launcher" i]',
  'button[aria-label*="chat" i]',
  'button[aria-label*="open" i]',
];

function styleLauncher(btn) {
  // maat (werkt samen met CSS in index.html)
  btn.style.width = '80px';
  btn.style.height = '80px';

  // eigen icoon
  btn.style.backgroundImage = `url("${IMG_URL}")`;
  btn.style.backgroundSize = 'contain';
  btn.style.backgroundRepeat = 'no-repeat';
  btn.style.backgroundPosition = 'center';
  btn.style.backgroundColor = 'transparent';
  btn.style.border = 'none';
  btn.style.boxShadow = 'none';

  // standaard binnen-icoon verbergen
  const innerIcon = btn.querySelector?.('svg, img');
  if (innerIcon) innerIcon.style.display = 'none';
}

/* ------------ Header titles (optioneel forceren) ------------ */
function setHeaderText(rootLike) {
  const root = rootLike?.shadowRoot || rootLike || document;
  const header = root.querySelector?.('.n8n-chat-header, [class*="chat-header" i], header');
  if (!header) return;

  const h = header.querySelector?.('h1, h2, [data-title], .title');
  if (h) h.textContent = TITLE;

  const sub = header.querySelector?.('p, [data-subtitle], .subtitle');
  if (sub) sub.textContent = SUBTITLE;
}

/* ------------ Bootstrap / observe DOM ------------ */
(function boot() {
  const customBtn = document.getElementById('custom-launcher');
  let realLauncher = null;

  function apply() {
    // 1) Zoek de echte launcher diep in (shadow) DOM
    realLauncher = realLauncher || queryDeep(LAUNCHER_SELECTORS);

    if (realLauncher) {
      // a) restyle echte launcher
      styleLauncher(realLauncher);
      // b) verberg onze fallback knop
      if (customBtn) customBtn.style.display = 'none';
    } else {
      // Launcher nog niet aanwezig: toon onze eigen knop als fallback
      if (customBtn) customBtn.style.display = 'block';
    }

    // 2) Probeer header-teksten te zetten (zowel light als shadow roots)
    const containers = [
      document,
      document.querySelector('#n8n-chat'),
      document.querySelector('[class*="chat-container" i]'),
    ].filter(Boolean);
    containers.forEach(setHeaderText);

    return Boolean(realLauncher);
  }

  // Fallback-knop klikt door naar de echte launcher zodra die er is
  if (customBtn) {
    customBtn.addEventListener('click', () => {
      const btn = realLauncher || queryDeep(LAUNCHER_SELECTORS);
      if (btn) btn.click();
    });
  }

  // probeer direct
  if (apply()) return;

  // observeer zowel document als body voor mutaties
  const mo = new MutationObserver(() => { if (apply()) mo.disconnect(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
