import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

/** Teksten / content **/
const TITLE = 'Welkom bij Dimensio 👋';
const SUBTITLE = 'Stel je vraag, we helpen je graag!';
const IMG_URL = 'ChatImage.png'; // zelfde map als index.html & dit bestand

/** Chat initialiseren volgens de documentatie */
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

/** ---------- Launcher (widget) vervangen door eigen afbeelding ---------- */
/* In de docs zijn alleen toggle-variabelen voor kleur/maat beschikbaar.
   We wachten tot de knop bestaat en zetten daar onze afbeelding op. */

function findLauncher() {
  // Meest voorkomende selectoren in de huidige widget
  return (
    document.querySelector('button.n8n-chat-launcher') ||        // officiële class
    document.querySelector('button[class*="launcher" i]') ||     // fallback
    document.querySelector('button[aria-label*="chat" i]')       // fallback
  );
}

function styleLauncher(btn) {
  // maat (werkt samen met --chat--toggle--size uit CSS)
  btn.style.width = '80px';
  btn.style.height = '80px';

  // eigen icoon als achtergrond
  btn.style.backgroundImage = `url("${IMG_URL}")`;
  btn.style.backgroundSize = 'contain';
  btn.style.backgroundRepeat = 'no-repeat';
  btn.style.backgroundPosition = 'center';
  btn.style.backgroundColor = 'transparent';

  // rand/schaduw uit
  btn.style.border = 'none';
  btn.style.boxShadow = 'none';

  // standaard binnen-icoon verbergen (svg/img)
  const innerIcon = btn.querySelector('svg, img');
  if (innerIcon) innerIcon.style.display = 'none';

  // Voor screenreaders blijft het label bestaan; visueel is het je logo
  btn.style.color = 'transparent';
}

/** Header-teksten forceren als het thema ze niet direct toont */
function setHeaderText(root) {
  const header =
    root.querySelector('.n8n-chat-header, [class*="chat-header" i], header');
  if (!header) return;

  const h = header.querySelector('h1, h2, [data-title], .title');
  if (h) h.textContent = TITLE;

  const sub = header.querySelector('p, [data-subtitle], .subtitle');
  if (sub) sub.textContent = SUBTITLE;
}

/** Observeer DOM totdat widget geladen is */
(function boot() {
  const tryNow = () => {
    const btn = findLauncher();
    if (btn) styleLauncher(btn);

    const panel =
      document.querySelector('.n8n-chat-container') ||
      document.querySelector('[class*="chat-container" i]') ||
      document.querySelector('[role="dialog"]');
    if (panel) setHeaderText(panel);

    // stop observer wanneer we zowel knop als panel hebben gezien
    return !!btn && !!panel;
  };

  if (tryNow()) return;

  const mo = new MutationObserver(() => {
    if (tryNow()) mo.disconnect();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
