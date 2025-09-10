// js/chat.js
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

createChat({
  // VERPLICHT
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',

  // ── Opties die je vaak wilt tweaken ───────────────────────────────────
  // theme: 'dark',            // 'dark' (default) of 'light'
  // title: 'Supportbot',      // kop bovenin het venster
  // subtitle: 'Stel je vraag',
  // position: 'bottom-right', // of 'bottom-left'
  // inputPlaceholder: 'Typ je bericht…',
  // initialMessages: ['Hoi! Waar kan ik mee helpen?'],
  // persistentHistory: true,  // bewaar lokale sessies in de browser
  // target: null,             // laat leeg voor floating popup (aanrader voor test)
  // openByDefault: false,     // true = venster staat direct open bij pageload
  // launcherText: undefined,  // tekst op de knop (indien ondersteund)
  // zIndex: 9999,             // forceer bovenop andere elementen

  // ── Geavanceerd / nice-to-have ────────────────────────────────────────
  // extraHeaders: {           // meesturen met elke request (niet altijd nodig)
  //   'X-Experiment': 'A'
  // },
  // metadata: { source: 'testsite' }, // mee te geven context voor je flow
});
