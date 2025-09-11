import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

const TITLE = 'Welkom bij Dimensio 👋';
const SUBTITLE = 'Stel je vraag, we helpen je graag!';
const IMG_URL = 'Assets/chatboticon.png';

/**
 * 1) Start de widget (volgens de officiële opties)
 *    Let op: defaultLanguage moet "en" blijven (enige ondersteunde key),
 *    maar we vullen de strings met NL-teksten.
 */
createChat({
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',
  mode: 'window',
  target: '#n8n-chat',
  loadPreviousSession: true,
  showWelcomeScreen: true,
  defaultLanguage: 'en',
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

/**
 * 2) Custom launcher-icoon
 *    De widget exposeert geen image-optie; we patchen de knop na mount.
 *    We zoeken defensief naar de toggle-knop en zetten onze PNG als achtergrond.
 */
const SELECTORS = [
  'button.n8n-chat-toggle',
  'button.n8n-chat-launcher',
  'button[class*="toggle" i]',
  'button[class*="launcher" i]',
  'button[aria-label*="chat" i]',
];

function findLauncher(root = document) {
  for (const sel of SELECTORS) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function styleLauncher(btn) {
  if (!btn || btn.dataset.dimIconApplied === '1') return;

  // basis: transparante knop + onze image
  btn.style.backgroundImage = `url("${IMG_URL}")`;
  btn.style.backgroundSize = 'contain';
  btn.style.backgroundRepeat = 'no-repeat';
  btn.style.backgroundPosition = 'center';
  btn.style.backgroundColor = 'transparent';
  btn.style.border = 'none';
  btn.style.boxShadow = 'none';

  // eventuele ingebouwde svg verbergen
  const inner = btn.querySelector('svg, img');
  if (inner) inner.style.display = 'none';

  btn.dataset.dimIconApplied = '1';
}

function applyCustomizations() {
  const btn = findLauncher();
  if (btn) styleLauncher(btn);

  // zet de headerteksten in het welkomstscherm mocht het thema ze niet tonen
  const header = document.querySelector('.n8n-chat-header, [class*="chat-header" i]');
  if (header) {
    const h = header.querySelector('h1, h2, [data-title], .title');
    if (h) h.textContent = TITLE;
    const p = header.querySelector('p, [data-subtitle], .subtitle');
    if (p) p.textContent = SUBTITLE;
  }

  return !!btn;
}

// voer meteen uit; als nog niet gemount, luister op mutaties
if (!applyCustomizations()) {
  const mo = new MutationObserver(() => { if (applyCustomizations()) mo.disconnect(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
}
