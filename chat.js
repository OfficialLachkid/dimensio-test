// js/chat.js
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

createChat({
  webhookUrl: 'https://n8n1.vbservices.org/webhook/c5796ce9-6a17-4181-b39c-20108ed3f122/chat',
  title: 'Supportbot',
  initialMessages: ['Hoi! \n Waar kan ik mee helpen?'],
});

// 🔗 Koppel onze knop aan de ingebouwde launcher (toggle/open)
const launch = () => {
  const builtIn = document.querySelector('.n8n-chat-launcher');
  if (builtIn) builtIn.click(); // simulateer de n8n-knop
};
document.getElementById('my-launcher')?.addEventListener('click', launch);
