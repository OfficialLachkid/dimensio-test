import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const TITLE = 'Welkom bij Dimensio 👋';
const SUBTITLE = 'Stel je vraag, we helpen je graag!';
const IMG_URL = 'https://officiallachkid.github.io/dimensio-test/ChatImage.png';

createChat({
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',

  mode: 'window', // or 'fullscreen'
  showWelcomeScreen: true,
  loadPreviousSession: true,
  defaultLanguage: 'en',

  initialMessages: ['Hoi! Waar kan ik mee helpen?'],

  i18n: {
    en: {
      title: TITLE,
      subtitle: SUBTITLE,
      inputPlaceholder: 'Typ hier je bericht…',
      getStarted: 'Nieuw gesprek starten',
      footer: '',
    }
  },

  enableStreaming: false, // set true if your webhook supports streaming
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
  console.log("🎯 Custom chat icon applied!");

  // Size of the button
  btn.style.width = '80px';
  btn.style.height = '80px';

  // Use your custom image
  btn.style.backgroundImage = `url("${IMG_URL}")`;
  btn.style.backgroundSize = 'contain';
  btn.style.backgroundRepeat = 'no-repeat';
  btn.style.backgroundPosition = 'center';
  btn.style.backgroundColor = 'transparent';
  btn.style.border = 'none';
  btn.style.boxShadow = 'none';

  // Hide default icon
  const innerIcon = btn.querySelector('svg, img');
  if (innerIcon) innerIcon.style.display = 'none';
}

/* ---- Force header title/subtitle if theme ignores options ---- */
function setHeaderText(root) {
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
