import { auth, db, requireUser } from './auth.js';
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp, where } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

function render(target, messages) {
  target.innerHTML = messages.map((message) => `<p><strong>${message.leaderName || message.email}</strong><span>${message.text}</span></p>`).join('');
  target.scrollTop = target.scrollHeight;
}

export function mountChat(type, countryId = '') {
  requireUser((user, profile) => {
    const list = document.querySelector(`[data-chat-list="${type}"]`);
    const form = document.querySelector(`[data-chat-form="${type}"]`);
    const filters = type === 'country' ? [where('countryId', '==', countryId)] : [where('type', '==', 'global')];
    onSnapshot(query(collection(db, 'messages'), ...filters, orderBy('createdAt', 'asc'), limit(100)), (snapshot) => render(list, snapshot.docs.map((item) => item.data())));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = form.querySelector('input');
      const text = input.value.trim().slice(0, 240);
      if (!text) return;
      input.value = '';
      await addDoc(collection(db, 'messages'), { text, type, countryId, uid: user.uid, email: user.email, leaderName: profile.leaderName || auth.currentUser.displayName || 'Player', createdAt: serverTimestamp(), deleted: false });
    });
  });
}

const globalChat = document.querySelector('[data-chat-form="global"]');
if (globalChat) mountChat('global');
