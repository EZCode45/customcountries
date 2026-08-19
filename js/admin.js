import { adminEmails, auth, db, requireUser } from './auth.js';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

function guard(user) {
  if (!adminEmails.includes(user.email)) {
    document.body.innerHTML = '<main class="shell"><section class="card"><h1>Admins only</h1><p>This page is restricted.</p></section></main>';
    return false;
  }
  return true;
}

requireUser((user) => {
  if (!guard(user)) return;
  const users = document.querySelector('[data-admin-users]');
  const countries = document.querySelector('[data-admin-countries]');
  const chat = document.querySelector('[data-admin-chat]');
  onSnapshot(query(collection(db, 'users'), orderBy('joinedAt', 'desc')), (snapshot) => {
    users.innerHTML = snapshot.docs.map((item) => `<article class="mini"><strong>${item.data().email}</strong><button data-ban="${item.id}">Ban</button></article>`).join('');
    users.querySelectorAll('[data-ban]').forEach((button) => button.addEventListener('click', async () => {
      await updateDoc(doc(db, 'users', button.dataset.ban), { banned: true });
      await setDoc(doc(collection(db, 'adminActions')), { action: 'ban_user', target: button.dataset.ban, admin: user.uid, createdAt: serverTimestamp() });
    }));
  });
  onSnapshot(query(collection(db, 'countries'), orderBy('createdAt', 'desc')), (snapshot) => {
    countries.innerHTML = snapshot.docs.map((item) => `<article class="mini"><strong>${item.data().name}</strong><button data-delete-country="${item.id}">Delete</button></article>`).join('');
    countries.querySelectorAll('[data-delete-country]').forEach((button) => button.addEventListener('click', () => deleteDoc(doc(db, 'countries', button.dataset.deleteCountry))));
  });
  onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snapshot) => {
    chat.innerHTML = snapshot.docs.map((item) => `<article class="mini"><span>${item.data().text}</span><button data-delete-message="${item.id}">Delete</button></article>`).join('');
    chat.querySelectorAll('[data-delete-message]').forEach((button) => button.addEventListener('click', () => updateDoc(doc(db, 'messages', button.dataset.deleteMessage), { deleted: true, text: 'Message removed by admin' })));
  });
  document.querySelector('[data-reset-territories]').addEventListener('click', async () => {
    const snapshot = await new Promise((resolve) => onSnapshot(collection(db, 'territories'), resolve));
    await Promise.all(snapshot.docs.map((item) => deleteDoc(doc(db, 'territories', item.id))));
    await setDoc(doc(collection(db, 'adminActions')), { action: 'reset_territories', admin: user.uid, createdAt: serverTimestamp() });
  });
});
