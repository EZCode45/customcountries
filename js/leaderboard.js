import { watchCountries, watchTerritories } from './countries.js';

let countries = [];
let territories = [];

function score(country) {
  const land = territories.filter((territory) => territory.countryId === country.id).length;
  return { ...country, land, total: land * 25 + Number(country.population || 0) + Number(country.economy || 0) + Number(country.military || 0) + Number(country.technology || 0) * 20 };
}

function render() {
  const rows = countries.map(score).sort((a, b) => b.total - a.total);
  document.querySelector('[data-leaderboard]').innerHTML = rows.map((country, index) => `<tr><td>${index + 1}</td><td><span class="dot" style="background:${country.color}"></span>${country.name}</td><td>${country.land}</td><td>${country.population}</td><td>${country.economy}</td><td>${country.military}</td><td>${country.technology}</td></tr>`).join('');
}

watchCountries((items) => {
  countries = items;
  render();
});
watchTerritories((items) => {
  territories = items;
  render();
});
