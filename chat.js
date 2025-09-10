import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const TITLE = 'Welkom bij Dimensio 👋';
const SUBTITLE = 'Stel je vraag, we helpen je graag!';
const IMG_URL = 'Assets/chatboticon.png';

/* 1) Widget starten (zoals in de docs) */
createChat({
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',
  mode: 'window',
  target: '#n8n-chat',                 // mag ook weg; helpt soms bij mounting
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

/* 2) Shadow-DOM veilige zoekfunctie voor de launcher (alleen de echte knop) */
const LAUNCHER_SELECTORS = [
  'button.n8n-chat-launcher',
  'button[class*="launcher" i]',
  'button[aria-label*="chat" i]',
  'button[aria-label*="open" i]',
];

function queryAllDeep(selectors, root = document) {
  const found = [];

  // zoek in deze root
  for (const sel of selectors) {
    (root.querySelectorAll?.(sel) || []).forEach(el => found.push(el));
  }

  // loop alle elementen en ga schaduwwortels in
  (root.querySelectorAll?.('*') || []).forEach(el => {
    if (el.shadowRoot) found.push(...queryAllDeep(selectors, el.shadowRoot));
  });

  // alleen zichtbare knoppen; sluit eventuele eigen fallback uit
  return found.filter(el => {
    if (el.id === 'custom-launcher' || el.id === 'my-fallback-launcher') return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  });
}

const queryDeep = selectors => queryAllDeep(selectors)[0] || null;

/* 3) Launcher stylen met jouw PNG */
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

  // standaard icoon verbergen
  const inner = btn.querySelector?.('svg, img');
  if (inner) inner.style.display = 'none';
}

/* 4) (optioneel) Header-teksten forceren als thema ze niet toont */
function setHeaderText(rootLike) {
  const root = rootLike?.shadowRoot || rootLike || document;
  const header = root.querySelector?.('.n8n-chat-header, [class*="chat-header" i], header');
  if (!header) return;

  const h = header.querySelector?.('h1, h2, [data-title], .title');
  if (h) h.textContent = TITLE;

  const sub = header.querySelector?.('p, [data-subtitle], .subtitle');
  if (sub) sub.textContent = SUBTITLE;
}

/* 5) Wachten tot de widget/launcher er is en dan stylen */
(function boot() {
  function apply() {
    const btn = queryDeep(LAUNCHER_SELECTORS);
    if (btn) styleLauncher(btn);

    [document, document.querySelector('#n8n-chat')].filter(Boolean).forEach(setHeaderText);
    return Boolean(btn);
  }

  if (apply()) return;

  const mo = new MutationObserver(() => { if (apply()) mo.disconnect(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
