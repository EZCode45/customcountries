const seedTerritories = [
  { id: 1, name: 'Coconut Coast', owner: 'You', color: '#5eead4', x: 10, y: 13, size: 25, food: 72, science: 18, defense: 31 },
  { id: 2, name: 'Glasswood', owner: 'Mira', color: '#a78bfa', x: 40, y: 9, size: 20, food: 44, science: 39, defense: 26 },
  { id: 3, name: 'Ash March', owner: 'Juno', color: '#fb7185', x: 68, y: 17, size: 22, food: 37, science: 24, defense: 49 },
  { id: 4, name: 'Brass Vale', owner: 'You', color: '#facc15', x: 24, y: 48, size: 18, food: 59, science: 27, defense: 28 },
  { id: 5, name: 'North Lanterns', owner: 'Keo', color: '#60a5fa', x: 55, y: 49, size: 26, food: 54, science: 35, defense: 33 },
  { id: 6, name: 'Salt Crown', owner: 'Rhea', color: '#f97316', x: 78, y: 58, size: 17, food: 49, science: 22, defense: 42 }
];

const eraNames = ['Founding', 'Bronze Trails', 'Sail Age', 'Steam Leagues', 'Signal Century', 'Orbital Pact'];
const icons = { crown: '♛', food: '🌾', science: '⚗', defense: '⚔', users: '◎', law: '◈' };
let year = 1;
let territories = seedTerritories.map((territory) => ({ ...territory }));
let selectedId = 1;

function eraFor(currentYear) {
  return eraNames[Math.min(eraNames.length - 1, Math.floor((currentYear - 1) / 25))];
}

function selectedTerritory() {
  return territories.find((territory) => territory.id === selectedId) || territories[0];
}

function stat(icon, label, value) {
  return `<div class="stat"><span>${icon}</span><div><small>${label}</small><strong>${value}</strong></div></div>`;
}

function feature(icon, title, text) {
  return `<article><span>${icon}</span><h3>${title}</h3><p>${text}</p></article>`;
}

function totals() {
  return territories.filter((territory) => territory.owner === 'You').reduce((sum, territory) => ({
    food: sum.food + territory.food,
    science: sum.science + territory.science,
    defense: sum.defense + territory.defense
  }), { food: 0, science: 0, defense: 0 });
}

function advanceTime() {
  territories = territories.map((territory, index) => {
    const growth = territory.owner === 'You' ? 7 : 4 + (index % 3);
    return {
      ...territory,
      food: Math.min(99, territory.food + growth),
      science: Math.min(99, territory.science + 3 + (year % 4)),
      defense: Math.min(99, territory.defense + 2 + (index % 2))
    };
  });
  year += 5;
  render();
}

function claimTerritory() {
  const target = selectedTerritory();
  territories = territories.map((territory) => territory.id === target.id ? { ...territory, owner: 'You', color: '#2dd4bf', defense: territory.defense + 8 } : territory);
  render();
}

function render() {
  const selected = selectedTerritory();
  const national = totals();
  document.getElementById('root').innerHTML = `<main>
    <section class="hero">
      <div>
        <p class="eyebrow">Persistent multiplayer nation builder</p>
        <h1>Shape a living world where every player owns territory and history keeps moving.</h1>
        <p class="intro">Found a country, claim land, trade resources, defend borders, and watch your civilization progress from year ${year} through the ${eraFor(year)}.</p>
        <div class="actions">
          <button id="advance">Advance 5 years</button>
          <button id="claim" class="ghost">Claim selected land</button>
        </div>
      </div>
      <div class="yearCard"><span>World year</span><strong>${year}</strong><small>${eraFor(year)}</small></div>
    </section>
    <section class="dashboard">
      <article class="panel mapPanel">
        <div class="panelHeader"><h2>Live territory map</h2><span>${territories.length} regions online</span></div>
        <div class="map">${territories.map((territory) => `<button class="territory ${selected.id === territory.id ? 'active' : ''}" style="--x:${territory.x}%;--y:${territory.y}%;--size:${territory.size}%;--color:${territory.color}" data-id="${territory.id}"><span>${territory.name}</span></button>`).join('')}</div>
      </article>
      <aside class="panel detailPanel">
        <div class="ownerBadge"><span>${icons.crown}</span>${selected.owner}</div>
        <h2>${selected.name}</h2>
        <p>${selected.owner === 'You' ? 'Your governors are ready to expand infrastructure and write the next chapter.' : `${selected.owner} controls this region. Diplomacy or conquest can bring it into your country.`}</p>
        <div class="stats">${stat(icons.food, 'Food', selected.food)}${stat(icons.science, 'Science', selected.science)}${stat(icons.defense, 'Defense', selected.defense)}</div>
      </aside>
    </section>
    <section class="cards">
      ${feature(icons.users, 'Player countries', 'Every user starts with a capital, color, banner, neighbors, and claims that other players can see.')}
      ${feature(icons.law, 'Time progression', 'Turns push the world through eras, unlocking laws, units, trade routes, wonders, and new border pressure.')}
      ${feature(icons.defense, 'Multiplayer tension', 'Alliances, raids, treaties, and shared world events keep the map changing after every season.')}
    </section>
    <section class="panel timeline">
      <h2>Your country overview</h2>
      <div class="timelineGrid">${stat(icons.food, 'National food', national.food)}${stat(icons.science, 'Research', national.science)}${stat(icons.defense, 'Security', national.defense)}</div>
    </section>
  </main>`;
  document.getElementById('advance').addEventListener('click', advanceTime);
  document.getElementById('claim').addEventListener('click', claimTerritory);
  document.querySelectorAll('.territory').forEach((button) => button.addEventListener('click', () => {
    selectedId = Number(button.dataset.id);
    render();
  }));
}

render();
