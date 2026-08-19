import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { firebaseConfig, adminEmails } from './firebase-config.js';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function isConfigured() {
  return !firebaseConfig.apiKey.includes('PASTE_') && !firebaseConfig.projectId.includes('PASTE_');
}

export function showSetupWarning() {
  if (isConfigured()) return;
  const target = document.querySelector('[data-setup-warning]');
  if (target) target.textContent = 'Add your Firebase project keys in js/firebase-config.js to enable accounts, realtime multiplayer, chat, and admin tools.';
}

export async function register(email, password, leaderName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: leaderName });
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    email,
    leaderName,
    countryId: '',
    joinedAt: serverTimestamp(),
    lastOnline: serverTimestamp(),
    achievements: ['Founder'],
    banned: false,
    admin: adminEmails.includes(email)
  }, { merge: true });
  return credential.user;
}

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', credential.user.uid), { lastOnline: serverTimestamp() }, { merge: true });
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export function requireUser(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.href = 'login.html';
      return;
    }
    const snapshot = await getDoc(doc(db, 'users', user.uid));
    const profile = snapshot.exists() ? snapshot.data() : {};
    if (profile.banned) {
      document.body.innerHTML = '<main class="shell"><section class="card"><h1>Account banned</h1><p>Your account cannot access this world.</p></section></main>';
      return;
    }
    callback(user, profile);
  });
}

export function bindAuthNav() {
  const outlet = document.querySelector('[data-auth-nav]');
  if (!outlet) return;
  onAuthStateChanged(auth, (user) => {
    outlet.innerHTML = user ? `<span>${user.email}</span><button data-logout>Logout</button>` : '<a href="login.html">Login</a><a href="register.html">Register</a>';
    const button = outlet.querySelector('[data-logout]');
    if (button) button.addEventListener('click', logout);
  });
}

showSetupWarning();
bindAuthNav();
