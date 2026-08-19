import { requireUser } from './auth.js';
import { claimTerritory, currentYear, ensureWorld, eraName, techLevelForYear, watchMyCountry, watchTerritories, watchWorld } from './countries.js';

let map;
let drawn = [];
let myCountry = null;
let pendingPoint = null;
let world = {};
let territories = [];

function squareAround(latlng) {
  const span = Math.max(.8, map.getZoom() < 3 ? 4 : 1.4);
  return [
    [latlng.lat - span, latlng.lng - span],
    [latlng.lat - span, latlng.lng + span],
    [latlng.lat + span, latlng.lng + span],
    [latlng.lat + span, latlng.lng - span]
  ];
}

function paintTerritories() {
  drawn.forEach((layer) => layer.remove());
  drawn = territories.map((territory) => L.polygon(territory.polygon, { color: territory.color, fillColor: territory.color, fillOpacity: .45, weight: 2 }).addTo(map).bindPopup(`<strong>${territory.countryName}</strong><br>${territory.population || 2}M people<br>${territory.economy || 10} economy`));
}

function updateClock() {
  const year = currentYear(world.startedAt);
  document.querySelector('[data-year]').textContent = year;
  document.querySelector('[data-era]').textContent = eraName(year);
  document.querySelector('[data-tech]').textContent = techLevelForYear(year);
}

async function claimPending() {
  if (!myCountry || !pendingPoint) return;
  await claimTerritory(myCountry, squareAround(pendingPoint));
  pendingPoint = null;
}

function init() {
  map = L.map('worldMap', { minZoom: 2, worldCopyJump: true }).setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'OpenStreetMap' }).addTo(map);
  map.on('click', (event) => {
    pendingPoint = event.latlng;
    document.querySelector('[data-selection]').textContent = `${event.latlng.lat.toFixed(2)}, ${event.latlng.lng.toFixed(2)}`;
  });
  document.querySelector('[data-claim]').addEventListener('click', claimPending);
  setInterval(updateClock, 1000);
}

requireUser(async (user) => {
  init();
  await ensureWorld();
  watchWorld((nextWorld) => {
    world = nextWorld;
    updateClock();
  });
  watchTerritories((items) => {
    territories = items;
    paintTerritories();
  });
  watchMyCountry(user.uid, (country) => {
    myCountry = country;
    document.querySelector('[data-country]').textContent = country ? country.name : 'Create or join a country first';
  });
});
