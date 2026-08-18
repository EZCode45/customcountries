const eras = [
  { name: 'Founding Age', year: 1, techs: ['Oral Law', 'Stone Roads', 'Granaries'], unlock: 'Village Councils' },
  { name: 'Bronze Age', year: 25, techs: ['Bronze Working', 'Irrigation', 'Border Forts'], unlock: 'Professional Governors' },
  { name: 'Classical Age', year: 60, techs: ['Written Code', 'Currency', 'Harbors'], unlock: 'Trade Treaties' },
  { name: 'Steam Age', year: 110, techs: ['Steam Engines', 'Rail Logistics', 'Factories'], unlock: 'Industrial Districts' },
  { name: 'Signal Age', year: 170, techs: ['Radio Towers', 'Flight', 'Medicine'], unlock: 'Global Alliances' },
  { name: 'Orbital Age', year: 240, techs: ['Satellites', 'Fusion Grid', 'Climate Shield'], unlock: 'Planetary Congress' }
];

const seedTerritories = [
  { id: 1, name: 'Coconut Coast', province: 'Capital Province', owner: 'The Coconut Republic', color: '#5eead4', x: 8, y: 18, size: 25, population: 21, food: 72, industry: 31, science: 18, defense: 31 },
  { id: 2, name: 'Glasswood', province: 'Western March', owner: 'Mira Dominion', color: '#a78bfa', x: 38, y: 8, size: 20, population: 13, food: 44, industry: 26, science: 39, defense: 26 },
  { id: 3, name: 'Ash March', province: 'Ember Frontier', owner: 'Juno League', color: '#fb7185', x: 68, y: 18, size: 22, population: 16, food: 37, industry: 41, science: 24, defense: 49 },
  { id: 4, name: 'Brass Vale', province: 'Southern Farms', owner: 'The Coconut Republic', color: '#facc15', x: 22, y: 51, size: 18, population: 12, food: 59, industry: 28, science: 27, defense: 28 },
  { id: 5, name: 'North Lanterns', province: 'Highland Cities', owner: 'Keo Kingdom', color: '#60a5fa', x: 54, y: 47, size: 26, population: 19, food: 54, industry: 33, science: 35, defense: 33 },
  { id: 6, name: 'Salt Crown', province: 'Eastern Ports', owner: 'Rhea Compact', color: '#f97316', x: 78, y: 59, size: 17, population: 10, food: 49, industry: 36, science: 22, defense: 42 },
  { id: 7, name: 'Moonstep Range', province: 'Northern Shield', owner: 'Unclaimed', color: '#94a3b8', x: 17, y: 73, size: 16, population: 7, food: 36, industry: 22, science: 16, defense: 53 },
  { id: 8, name: 'Rivergate', province: 'Central Crossing', owner: 'Unclaimed', color: '#94a3b8', x: 49, y: 73, size: 19, population: 9, food: 66, industry: 19, science: 25, defense: 21 }
];

const countryName = 'The Coconut Republic';
const banners = ['Trade Pact', 'Border Survey', 'Census Complete', 'New Charter', 'Harvest Festival', 'Spy Network'];
let year = 1;
let season = 1;
let territories = seedTerritories.map((territory) => ({ ...territory }));
let selectedId = 1;
let log = ['Year 1: The Coconut Republic raises its banner on the coast.'];

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
  return territories.filter((territory) => territory.owner === countryName);
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
  return `<div class="stat"><span>${icon}</span><div><small>${label}</small><strong>${value}</strong></div></div>`;
}

function advanceTime() {
  const previousYear = year;
  const era = currentEra();
  territories = territories.map((territory, index) => {
    const owned = territory.owner === countryName;
    const scienceLift = unlockedTechs().length;
    const growth = owned ? 5 + Math.floor(scienceLift / 2) : 2 + (index % 3);
    return {
      ...territory,
      population: Math.min(99, territory.population + (owned ? 2 : 1)),
      food: Math.min(120, territory.food + growth),
      industry: Math.min(120, territory.industry + 2 + Math.floor(scienceLift / 3)),
      science: Math.min(120, territory.science + 3 + Math.floor(scienceLift / 2)),
      defense: Math.min(120, territory.defense + 2 + (era.name.includes('Age') ? 1 : 0))
    };
  });
  year += 10;
  season += 1;
  const crossedEra = eras.find((next) => next.year > previousYear && next.year <= year);
  const unlocked = crossedEra ? `Unlocked ${crossedEra.unlock}.` : banners[season % banners.length];
  log = [`Year ${year}: ${unlocked}`, ...log].slice(0, 5);
  render();
}

function claimTerritory() {
  const target = selectedTerritory();
  territories = territories.map((territory) => territory.id === target.id ? { ...territory, owner: countryName, color: '#2dd4bf', defense: Math.min(120, territory.defense + 10), industry: Math.min(120, territory.industry + 6) } : territory);
  log = [`Year ${year}: ${target.name} joined ${countryName}.`, ...log].slice(0, 5);
  render();
}

function investScience() {
  territories = territories.map((territory) => territory.owner === countryName ? { ...territory, science: Math.min(120, territory.science + 12), industry: Math.min(120, territory.industry + 3) } : territory);
  log = [`Year ${year}: Scholars begin a national technology push.`, ...log].slice(0, 5);
  render();
}

function renderTechTree() {
  const techs = unlockedTechs();
  return eras.map((era) => `<div class="techEra ${year >= era.year ? 'unlocked' : ''}"><strong>${era.name}</strong><small>Year ${era.year}</small><div>${era.techs.map((tech) => `<span>${techs.includes(tech) ? '✓' : '○'} ${tech}</span>`).join('')}</div><em>${year >= era.year ? era.unlock : 'Locked'}</em></div>`).join('');
}

function render() {
  const selected = selectedTerritory();
  const national = totals();
  const era = currentEra();
  const upcoming = nextEra();
  document.getElementById('root').innerHTML = `<main>
    <section class="hero">
      <div>
        <p class="eyebrow">Persistent multiplayer country simulator</p>
        <h1>${countryName}</h1>
        <p class="intro">Rule provinces, manage population, claim borders, and unlock technology as the shared world advances through time.</p>
        <div class="actions"><button id="advance">Advance 10 years</button><button id="claim" class="ghost">Claim selected province</button><button id="research" class="ghost">Invest in research</button></div>
      </div>
      <div class="yearCard"><span>World year</span><strong>${year}</strong><small>${era.name}</small></div>
    </section>
    <section class="dashboard">
      <article class="panel mapPanel">
        <div class="panelHeader"><h2>Country map</h2><span>${territories.length} provinces contested</span></div>
        <div class="map">${territories.map((territory) => `<button class="territory ${selected.id === territory.id ? 'active' : ''}" style="--x:${territory.x}%;--y:${territory.y}%;--size:${territory.size}%;--color:${territory.color}" data-id="${territory.id}"><span>${territory.name}</span><small>${territory.owner}</small></button>`).join('')}</div>
      </article>
      <aside class="panel detailPanel">
        <div class="ownerBadge"><span>♛</span>${selected.owner}</div>
        <h2>${selected.province}</h2>
        <p>${selected.name} is ${selected.owner === countryName ? 'part of your country and contributes to national growth.' : 'outside your flag and can become a diplomatic target or future conquest.'}</p>
        <div class="stats">${stat('👥', 'Population', selected.population)}${stat('🌾', 'Food', selected.food)}${stat('⚙', 'Industry', selected.industry)}${stat('⚗', 'Science', selected.science)}${stat('⚔', 'Defense', selected.defense)}</div>
      </aside>
    </section>
    <section class="panel countryPanel">
      <div><h2>National cabinet</h2><p>${ownedTerritories().length} provinces, ${national.population} million citizens, ${unlockedTechs().length} technologies unlocked.</p></div>
      <div class="timelineGrid">${stat('👥', 'Citizens', national.population)}${stat('🌾', 'Food reserve', national.food)}${stat('⚙', 'Industry', national.industry)}${stat('⚗', 'Research', national.science)}${stat('⚔', 'Security', national.defense)}</div>
    </section>
    <section class="techLayout">
      <article class="panel"><div class="panelHeader"><h2>Technology unlocks</h2><span>${upcoming ? `Next era in year ${upcoming.year}` : 'All eras unlocked'}</span></div><div class="techTree">${renderTechTree()}</div></article>
      <article class="panel"><h2>World history</h2><div class="log">${log.map((entry) => `<p>${entry}</p>`).join('')}</div></article>
    </section>
  </main>`;
  document.getElementById('advance').addEventListener('click', advanceTime);
  document.getElementById('claim').addEventListener('click', claimTerritory);
  document.getElementById('research').addEventListener('click', investScience);
  document.querySelectorAll('.territory').forEach((button) => button.addEventListener('click', () => {
    selectedId = Number(button.dataset.id);
    render();
  }));
}

render();
