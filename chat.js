import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const TITLE = 'Welkom bij Dimensio 👋';
const SUBTITLE = 'Stel je vraag, we helpen je graag!';
const IMG_URL = 'ChatImage.png'; // same folder as index.html

createChat({
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',
  title: TITLE,           // some themes use this directly
  subtitle: SUBTITLE,     // some themes use this directly
  initialMessages: ['Hoi! Waar kan ik mee helpen?'],
});

/* ---- Style the built-in launcher once it exists ---- */
function findLauncher() {
  return (
    document.querySelector('button.n8n-chat-launcher') ||
    document.querySelector('button[class*="launcher" i]') ||
    document.querySelector('button[aria-label*="chat" i]')
  );
}

function styleLauncher(btn) {
  // size
  btn.style.width = '100px';
  btn.style.height = '100px';

  // replace visuals
  btn.style.backgroundImage = `url("${IMG_URL}")`;
  btn.style.backgroundSize = 'contain';
  btn.style.backgroundRepeat = 'no-repeat';
  btn.style.backgroundPosition = 'center';
  btn.style.backgroundColor = 'transparent';
  btn.style.border = 'none';
  btn.style.boxShadow = 'none';

  // hide default icon inside
  const innerIcon = btn.querySelector('svg, img');
  if (innerIcon) innerIcon.style.display = 'none';
}

/* ---- Force header title/subtitle if theme ignores options ---- */
function setHeaderText(root) {
  // Try common header containers and headings
  const header = root.querySelector('.n8n-chat-header, [class*="chat-header" i], header');
  if (!header) return;

  const h = header.querySelector('h1, h2, [data-title], .title');
  if (h) h.textContent = TITLE;

  const sub = header.querySelector('p, [data-subtitle], .subtitle');
  if (sub) sub.textContent = SUBTITLE;
}

/* Observe DOM for widget mount */
(function boot() {
  const tryNow = () => {
    const btn = findLauncher();
    if (btn) styleLauncher(btn);

    // Find widget root (panel) and set header text
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