import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const TITLE = 'Welkom bij Dimensio 👋';
const SUBTITLE = 'Stel je vraag, we helpen je graag!';
const IMG_URL = 'ChatImage.png'; // same folder as index.html & chat.js

createChat({
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',

  /* make the chat usable right away (no “New conversation” button) */
  showWelcomeScreen: false,
  loadPreviousSession: true,

  /* text & placeholders (some themes read these directly) */
  defaultLanguage: 'en',
  initialMessages: ['Hoi! Waar kan ik mee helpen?'],
  i18n: {
    en: {
      title: TITLE,
      subtitle: SUBTITLE,
      inputPlaceholder: 'Typ hier je bericht…',
      getStarted: 'Nieuw gesprek',
      footer: '', // not rendered, but set empty just in case
    },
  },

  /* layout mode can be 'window' or 'fullscreen' */
  mode: 'window',
});

/* ---- Find the built-in launcher button ---- */
function findLauncher() {
  return (
    document.querySelector('button.n8n-chat-launcher') ||
    document.querySelector('button[class*="launcher" i]') ||
    document.querySelector('button[aria-label*="chat" i]')
  );
}

/* ---- Replace its visuals with your PNG ---- */
function styleLauncher(btn) {
  // size of the circular button (tweak if needed)
  btn.style.width = '84px';
  btn.style.height = '84px';

  // image as background
  btn.style.backgroundImage = `url("${IMG_URL}")`;
  btn.style.backgroundSize = 'contain';
  btn.style.backgroundRepeat = 'no-repeat';
  btn.style.backgroundPosition = 'center';

  // remove default look
  btn.style.backgroundColor = 'transparent';
  btn.style.border = 'none';
  btn.style.boxShadow = 'none';

  // hide any default inner icon (svg/img)
  const innerIcon = btn.querySelector('svg, img');
  if (innerIcon) innerIcon.style.display = 'none';
}

/* ---- Ensure header texts are applied even if theme ignores i18n ---- */
function setHeaderText(root) {
  const header = root.querySelector('.n8n-chat-header, [class*="chat-header" i], header');
  if (!header) return;

  const h = header.querySelector('h1, h2, [data-title], .title');
  if (h) h.textContent = TITLE;

  const sub = header.querySelector('p, [data-subtitle], .subtitle');
  if (sub) sub.textContent = SUBTITLE;
}

/* ---- Observe for widget mount and apply tweaks ---- */
(function boot() {
  const tryNow = () => {
    const btn = findLauncher();
    if (btn) styleLauncher(btn);

    const panel =
      document.querySelector('.n8n-chat-container') ||
      document.querySelector('[class*="chat-container" i]') ||
      document.querySelector('[role="dialog"]');
    if (panel) setHeaderText(panel);

    return !!btn && !!panel;
  };

  if (tryNow()) return;

  const mo = new MutationObserver(() => {
    if (tryNow()) mo.disconnect();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
