import { auth, db, requireUser } from './auth.js';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { watchCountries } from './countries.js';

function options(countries) {
  return countries.map((country) => `<option value="${country.id}">${country.name}</option>`).join('');
}

requireUser((user, profile) => {
  const form = document.querySelector('[data-diplomacy-form]');
  const from = form.querySelector('[name="fromCountry"]');
  const to = form.querySelector('[name="toCountry"]');
  const list = document.querySelector('[data-diplomacy-list]');
  watchCountries((countries) => {
    from.innerHTML = options(countries.filter((country) => country.members?.includes(user.uid) || country.ownerUid === user.uid));
    to.innerHTML = options(countries.filter((country) => country.id !== from.value));
  });
  onSnapshot(query(collection(db, 'alliances'), orderBy('createdAt', 'desc')), (snapshot) => {
    list.innerHTML = snapshot.docs.map((item) => {
      const data = item.data();
      return `<article class="mini"><strong>${data.type}</strong><span>${data.fromName} → ${data.toName}</span><button data-accept="${item.id}">Accept</button></article>`;
    }).join('');
    list.querySelectorAll('[data-accept]').forEach((button) => button.addEventListener('click', () => updateDoc(doc(db, 'alliances', button.dataset.accept), { status: 'accepted', decidedAt: serverTimestamp() })));
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const type = form.querySelector('[name="type"]').value;
    await addDoc(collection(db, type === 'Peace Treaty' ? 'treaties' : 'alliances'), { type, fromCountry: from.value, toCountry: to.value, fromName: from.selectedOptions[0]?.textContent || '', toName: to.selectedOptions[0]?.textContent || '', requestedBy: user.uid, requestedByEmail: user.email, status: 'pending', createdAt: serverTimestamp() });
    form.reset();
  });
});
