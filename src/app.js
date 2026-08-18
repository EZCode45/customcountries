const eras = [
  { name: 'Founding Age', year: 1, techs: ['Oral Law', 'Stone Roads', 'Granaries'], unlock: 'Village Councils' },
  { name: 'Bronze Age', year: 25, techs: ['Bronze Working', 'Irrigation', 'Border Forts'], unlock: 'Professional Governors' },
  { name: 'Classical Age', year: 60, techs: ['Written Code', 'Currency', 'Harbors'], unlock: 'Trade Treaties' },
  { name: 'Steam Age', year: 110, techs: ['Steam Engines', 'Rail Logistics', 'Factories'], unlock: 'Industrial Districts' },
  { name: 'Signal Age', year: 170, techs: ['Radio Towers', 'Flight', 'Medicine'], unlock: 'Global Alliances' },
  { name: 'Orbital Age', year: 240, techs: ['Satellites', 'Fusion Grid', 'Climate Shield'], unlock: 'Planetary Congress' }
];

const rulers = [
  { country: 'Mira Dominion', ruler: 'Mira', policy: 'Merchant Council', color: '#a78bfa' },
  { country: 'Juno League', ruler: 'Juno', policy: 'Frontier Assembly', color: '#fb7185' },
  { country: 'Keo Kingdom', ruler: 'Keo', policy: 'Royal Mandate', color: '#60a5fa' },
  { country: 'Rhea Compact', ruler: 'Rhea', policy: 'Harbor Senate', color: '#f97316' }
];

const seedTerritories = [
  { id: 1, name: 'Coconut Coast', owner: 'The Coconut Republic', ruler: 'You', policy: 'Free Settlers', color: '#5eead4', x: 12, y: 24, size: 16, population: 21, food: 72, industry: 31, science: 18, defense: 31 },
  { id: 2, name: 'Glasswood', owner: 'Mira Dominion', ruler: 'Mira', policy: 'Merchant Council', color: '#a78bfa', x: 39, y: 15, size: 13, population: 13, food: 44, industry: 26, science: 39, defense: 26 },
  { id: 3, name: 'Ash March', owner: 'Juno League', ruler: 'Juno', policy: 'Frontier Assembly', color: '#fb7185', x: 68, y: 23, size: 14, population: 16, food: 37, industry: 41, science: 24, defense: 49 },
  { id: 4, name: 'North Lanterns', owner: 'Keo Kingdom', ruler: 'Keo', policy: 'Royal Mandate', color: '#60a5fa', x: 54, y: 52, size: 17, population: 19, food: 54, industry: 33, science: 35, defense: 33 }
];

const policies = {
  'Free Settlers': { food: 6, industry: 2, science: 2, defense: 1 },
  'Science Charter': { food: 2, industry: 2, science: 7, defense: 1 },
  'Military State': { food: 1, industry: 3, science: 1, defense: 7 },
  'Trade Republic': { food: 3, industry: 6, science: 3, defense: 1 }
};

const names = ['Rivergate', 'Moonstep', 'Brass Vale', 'Salt Crown', 'Pine Reach', 'Sun Basin', 'Amber Ford', 'Cloud Cape'];
let year = 1;
let nextId = 5;
let playerCountry = localStorage.getItem('country') || 'The Coconut Republic';
let playerPolicy = localStorage.getItem('policy') || 'Free Settlers';
let territories = seedTerritories.map((territory) => territory.owner === 'The Coconut Republic' ? { ...territory, owner: playerCountry, policy: playerPolicy } : { ...territory });
let selectedId = 1;
let log = [`Year 1: ${playerCountry} begins as a player ruled country.`];
let timer = null;

function clean(value) {
  return String(value).replace(/[&<>"]/g, (letter) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[letter]));
}

function currentEra() {
  return eras.reduce((active, era) => year >= era.year ? era : active, eras[0]);
}

function unlockedTechs() {
  return eras.filter((era) => year >= era.year).flatMap((era) => era.techs);
}

function nextEra() {
  return eras.find((era) => era.year > year);
}

function selectedTerritory() {
  return territories.find((territory) => territory.id === selectedId) || territories[0];
}

function ownedTerritories() {
  return territories.filter((territory) => territory.owner === playerCountry);
}

function totals() {
  return ownedTerritories().reduce((sum, territory) => ({
    population: sum.population + territory.population,
    food: sum.food + territory.food,
    industry: sum.industry + territory.industry,
    science: sum.science + territory.science,
    defense: sum.defense + territory.defense
  }), { population: 0, food: 0, industry: 0, science: 0, defense: 0 });
}

function stat(icon, label, value) {
  return `<div class="stat"><span>${icon}</span><div><small>${clean(label)}</small><strong>${clean(value)}</strong></div></div>`;
}

function advanceYear() {
  const previousYear = year;
  const techLift = unlockedTechs().length;
  territories = territories.map((territory, index) => {
    const boost = territory.owner === playerCountry ? policies[playerPolicy] : policies['Trade Republic'];
    return {
      ...territory,
      population: Math.min(999, territory.population + 1),
      food: Math.min(999, territory.food + boost.food + (index % 2)),
      industry: Math.min(999, territory.industry + boost.industry + Math.floor(techLift / 4)),
      science: Math.min(999, territory.science + boost.science + Math.floor(techLift / 3)),
      defense: Math.min(999, territory.defense + boost.defense + Math.floor(techLift / 5))
    };
  });
  year += 1;
  const crossedEra = eras.find((era) => era.year > previousYear && era.year <= year);
  if (crossedEra) log = [`Year ${year}: ${crossedEra.name} begins and ${crossedEra.unlock} is unlocked.`, ...log].slice(0, 6);
  render();
}

function startClock() {
  if (timer) clearInterval(timer);
  timer = setInterval(advanceYear, 5000);
}

function mapClaim(event) {
  if (!event.target.classList.contains('map')) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
  const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
  const name = names[(nextId + year) % names.length];
  const territory = { id: nextId, name: `${name} ${nextId}`, owner: playerCountry, ruler: 'You', policy: playerPolicy, color: '#2dd4bf', x: Math.max(2, Math.min(86, x)), y: Math.max(8, Math.min(82, y)), size: 12, population: 5, food: 42, industry: 20, science: 14, defense: 18 };
  territories = [...territories, territory];
  selectedId = nextId;
  nextId += 1;
  log = [`Year ${year}: You chose a new spot on the world map and claimed ${territory.name}.`, ...log].slice(0, 6);
  render();
}

function claimSelected() {
  const target = selectedTerritory();
  territories = territories.map((territory) => territory.id === target.id ? { ...territory, owner: playerCountry, ruler: 'You', policy: playerPolicy, color: '#2dd4bf', defense: Math.min(999, territory.defense + 10), industry: Math.min(999, territory.industry + 6) } : territory);
  log = [`Year ${year}: ${target.name} now follows your country rules.`, ...log].slice(0, 6);
  render();
}

function updateCountry(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const nextCountry = String(form.get('country') || playerCountry).trim().slice(0, 32) || playerCountry;
  const nextPolicy = String(form.get('policy') || playerPolicy);
  const previousCountry = playerCountry;
  playerCountry = nextCountry;
  playerPolicy = policies[nextPolicy] ? nextPolicy : playerPolicy;
  localStorage.setItem('country', playerCountry);
  localStorage.setItem('policy', playerPolicy);
  territories = territories.map((territory) => territory.owner === previousCountry ? { ...territory, owner: playerCountry, policy: playerPolicy } : territory);
  log = [`Year ${year}: You renamed and ruled your country as ${playerCountry} under ${playerPolicy}.`, ...log].slice(0, 6);
  render();
}

function simulatePlayer() {
  const player = rulers[(year + territories.length) % rulers.length];
  const name = names[(year + nextId) % names.length];
  const territory = { id: nextId, name: `${name} ${nextId}`, owner: player.country, ruler: player.ruler, policy: player.policy, color: player.color, x: 8 + ((year * 13 + nextId * 7) % 78), y: 12 + ((year * 9 + nextId * 11) % 70), size: 11 + (nextId % 5), population: 4 + (nextId % 6), food: 35, industry: 18, science: 18, defense: 20 };
  territories = [...territories, territory];
  selectedId = territory.id;
  nextId += 1;
  log = [`Year ${year}: ${player.ruler} claimed ${territory.name} for ${player.country}.`, ...log].slice(0, 6);
  render();
}

function renderTechTree() {
  const techs = unlockedTechs();
  return eras.map((era) => `<div class="techEra ${year >= era.year ? 'unlocked' : ''}"><strong>${clean(era.name)}</strong><small>Year ${era.year}</small><div>${era.techs.map((tech) => `<span>${techs.includes(tech) ? '✓' : '○'} ${clean(tech)}</span>`).join('')}</div><em>${year >= era.year ? clean(era.unlock) : 'Locked'}</em></div>`).join('');
}

function renderPolicyOptions() {
  return Object.keys(policies).map((policy) => `<option value="${clean(policy)}" ${policy === playerPolicy ? 'selected' : ''}>${clean(policy)}</option>`).join('');
}

function render() {
  const selected = selectedTerritory();
  const national = totals();
  const era = currentEra();
  const upcoming = nextEra();
  document.getElementById('root').innerHTML = `<main>
    <section class="hero">
      <div>
        <p class="eyebrow">Live multiplayer country simulator</p>
        <h1>${clean(playerCountry)}</h1>
        <p class="intro">Choose a spot on the world map, claim territory, rule your country however you want, and watch time advance by one year every five seconds.</p>
        <div class="actions"><button id="claim">Claim selected territory</button><button id="bot" class="ghost">Simulate other player</button></div>
      </div>
      <div class="yearCard"><span>World year</span><strong>${year}</strong><small>${clean(era.name)}</small></div>
    </section>
    <section class="dashboard">
      <article class="panel mapPanel">
        <div class="panelHeader"><h2>World map</h2><span>Click open water or land to claim a new spot</span></div>
        <div id="map" class="map">${territories.map((territory) => `<button class="territory ${selected.id === territory.id ? 'active' : ''}" style="--x:${territory.x}%;--y:${territory.y}%;--size:${territory.size}%;--color:${territory.color}" data-id="${territory.id}"><span>${clean(territory.name)}</span><small>${clean(territory.owner)}</small></button>`).join('')}</div>
      </article>
      <aside class="panel detailPanel">
        <div class="ownerBadge"><span>♛</span>${clean(selected.ruler)}</div>
        <h2>${clean(selected.name)}</h2>
        <p>${clean(selected.owner)} rules this land with ${clean(selected.policy)}. The ruler controls growth, research, defenses, and claims.</p>
        <div class="stats">${stat('👥', 'Population', selected.population)}${stat('🌾', 'Food', selected.food)}${stat('⚙', 'Industry', selected.industry)}${stat('⚗', 'Science', selected.science)}${stat('⚔', 'Defense', selected.defense)}</div>
      </aside>
    </section>
    <section class="panel countryPanel">
      <div><h2>Rule your country</h2><p>${ownedTerritories().length} territories, ${national.population} million citizens, ${unlockedTechs().length} technologies unlocked.</p></div>
      <form id="countryForm"><input name="country" value="${clean(playerCountry)}" maxlength="32"/><select name="policy">${renderPolicyOptions()}</select><button>Apply rule</button></form>
      <div class="timelineGrid">${stat('👥', 'Citizens', national.population)}${stat('🌾', 'Food reserve', national.food)}${stat('⚙', 'Industry', national.industry)}${stat('⚗', 'Research', national.science)}${stat('⚔', 'Security', national.defense)}</div>
    </section>
    <section class="techLayout">
      <article class="panel"><div class="panelHeader"><h2>Technology unlocks</h2><span>${upcoming ? `Next era in year ${upcoming.year}` : 'All eras unlocked'}</span></div><div class="techTree">${renderTechTree()}</div></article>
      <article class="panel"><h2>World history</h2><div class="log">${log.map((entry) => `<p>${clean(entry)}</p>`).join('')}</div></article>
    </section>
  </main>`;
  document.getElementById('claim').addEventListener('click', claimSelected);
  document.getElementById('bot').addEventListener('click', simulatePlayer);
  document.getElementById('countryForm').addEventListener('submit', updateCountry);
  document.getElementById('map').addEventListener('click', mapClaim);
  document.querySelectorAll('.territory').forEach((button) => button.addEventListener('click', () => {
    selectedId = Number(button.dataset.id);
    render();
  }));
}

render();
startClock();
