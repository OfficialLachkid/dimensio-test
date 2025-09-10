// js/chat.js
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

createChat({
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',
  title: 'Welkom bij Dimensio 👋',
  subtitle: 'Stel je vraag, we helpen je graag!',
  initialMessages: ['Hoi! Waar kan ik mee helpen?'],
});

const IMG_URL = 'ChatImage.png'; // your custom icon (same folder as index.html)

function styleLauncher(btn) {
  // size (adjust if you like)
  btn.style.width = '64px';
  btn.style.height = '64px';

  // replace visuals
  btn.style.backgroundImage = `url("${IMG_URL}")`;
  btn.style.backgroundSize = 'contain';
  btn.style.backgroundRepeat = 'no-repeat';
  btn.style.backgroundPosition = 'center';
  btn.style.backgroundColor = 'transparent';
  btn.style.border = 'none';
  btn.style.boxShadow = 'none';

  // hide any default icon inside the button (SVG/img)
  const innerIcon = btn.querySelector('svg, img');
  if (innerIcon) innerIcon.style.display = 'none';
}

// robustly locate the built-in launcher after the widget injects it
function findLauncher() {
  return (
    document.querySelector('button.n8n-chat-launcher') ||
    document.querySelector('button[class*="launcher" i]') ||
    document.querySelector('button[aria-label*="chat" i]')
  );
}

// Try immediately, then watch the DOM until it appears
(function initLauncherStyling() {
  const btnNow = findLauncher();
  if (btnNow) {
    styleLauncher(btnNow);
    return;
  }
  const mo = new MutationObserver(() => {
    const btn = findLauncher();
    if (btn) {
      styleLauncher(btn);
      mo.disconnect();
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
