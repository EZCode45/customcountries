import { auth, db } from './auth.js';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

export const colors = ['#2dd4bf', '#60a5fa', '#a78bfa', '#fb7185', '#f97316', '#facc15', '#4ade80', '#f472b6'];

export function currentYear(startedAt) {
  const start = startedAt?.toMillis ? startedAt.toMillis() : Number(localStorage.getItem('worldStart') || Date.now());
  localStorage.setItem('worldStart', String(start));
  return 1 + Math.floor((Date.now() - start) / 5000);
}

export function techLevelForYear(year) {
  if (year >= 280) return 6;
  if (year >= 190) return 5;
  if (year >= 120) return 4;
  if (year >= 60) return 3;
  if (year >= 25) return 2;
  return 1;
}

export function eraName(year) {
  return ['Founding', 'Bronze', 'Classical', 'Industrial', 'Information', 'Future'][techLevelForYear(year) - 1];
}

export async function ensureWorld() {
  const ref = doc(db, 'meta', 'world');
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) await setDoc(ref, { startedAt: serverTimestamp(), speed: 'one_year_per_five_seconds' });
  return ref;
}

export function watchWorld(callback) {
  return onSnapshot(doc(db, 'meta', 'world'), (snapshot) => callback(snapshot.data() || {}));
}

export function watchCountries(callback) {
  return onSnapshot(query(collection(db, 'countries'), orderBy('createdAt', 'desc')), (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))));
}

export function watchTerritories(callback) {
  return onSnapshot(collection(db, 'territories'), (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))));
}

export async function createCountry(data) {
  const user = auth.currentUser;
  const country = await addDoc(collection(db, 'countries'), {
    name: data.name,
    color: data.color,
    flag: data.flag,
    description: data.description,
    capital: data.capital,
    leaderName: data.leaderName,
    ownerUid: user.uid,
    members: [user.uid],
    economy: Number(data.economy || 25),
    population: Number(data.population || 10),
    technology: Number(data.technology || 1),
    military: Number(data.military || 10),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  await setDoc(doc(db, 'users', user.uid), { countryId: country.id, leaderName: data.leaderName, lastOnline: serverTimestamp() }, { merge: true });
  return country.id;
}

export async function updateCountry(countryId, data) {
  await updateDoc(doc(db, 'countries', countryId), { ...data, updatedAt: serverTimestamp() });
}

export async function joinCountry(countryId) {
  const user = auth.currentUser;
  const countryRef = doc(db, 'countries', countryId);
  const snapshot = await getDoc(countryRef);
  const members = snapshot.data().members || [];
  await updateDoc(countryRef, { members: [...new Set([...members, user.uid])], updatedAt: serverTimestamp() });
  await setDoc(doc(db, 'users', user.uid), { countryId, lastOnline: serverTimestamp() }, { merge: true });
}

export async function claimTerritory(country, shape) {
  const user = auth.currentUser;
  await addDoc(collection(db, 'territories'), {
    countryId: country.id,
    countryName: country.name,
    color: country.color,
    ownerUid: user.uid,
    polygon: shape,
    center: shape[0],
    claimedAt: serverTimestamp(),
    economy: 10,
    population: 2,
    military: 2
  });
}

export async function removeCountry(countryId) {
  await deleteDoc(doc(db, 'countries', countryId));
}

export function watchMyCountry(uid, callback) {
  return onSnapshot(query(collection(db, 'countries'), where('members', 'array-contains', uid)), (snapshot) => callback(snapshot.docs[0] ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null));
}
