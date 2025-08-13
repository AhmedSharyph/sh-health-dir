// PWA Install
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installButton').classList.remove('hidden');
});

document.getElementById('installButton').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') console.log('User accepted install prompt');
  deferredPrompt = null;
  document.getElementById('installButton').classList.add('hidden');
});

// Hamburger toggle
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navbarNav = document.createElement('div');
navbarNav.id = 'navbarNav';
navbarNav.className = 'hidden lg:flex lg:items-center lg:space-x-4 flex-col lg:flex-row';
navbarNav.innerHTML = `<a href="add-contact.html" class="block px-4 py-2 text-sm font-medium hover:text-emerald-700">Add Contact</a>`;
document.querySelector('nav > div').appendChild(navbarNav);

hamburgerBtn.addEventListener('click', () => {
  const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
  hamburgerBtn.setAttribute('aria-expanded', !expanded);
  navbarNav.classList.toggle('hidden');
});

// Data Loading & Search
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwndImcPMsQCTx1xLtxolE7Q7nOdN_nVpmOh7fw0U0Sy0-0u30Chp6ovUVhJgk2XdRuNg/exec';

function normalize(str) { return (str || '').toString().toLowerCase().replace(/\s+/g, ' ').trim(); }

let allRows = [];

async function loadData() {
  const container = document.getElementById('directoryContainer');
  try {
    const res = await fetch(WEB_APP_URL);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) { container.innerHTML = '<p class="no-results">No data found.</p>'; return; }
    container.innerHTML = '';

    const grouped = {};
    data.forEach(item => {
      const center = String(item['Health Center'] || 'Unknown').trim();
      if (!grouped[center]) grouped[center] = [];
      grouped[center].push(item);
    });

    for (const center in grouped) {
      const section = document.createElement('section');
      section.className = 'center-group';
      section.dataset.center = center.toLowerCase();

      const rowsHtml = grouped[center].map(person => {
        const fullName = String(person['Assigned To'] || '').trim();
        const role = String(person['Role  or Function'] || '').trim();
        const dept = String(person['Department'] || '').trim();
        const phone = String(person['Contact Number'] || '').trim();
        const searchText = normalize(`${center} ${fullName} ${role} ${dept} ${phone}`);

        return `
          <tr class="data-row" data-search="${searchText}">
            <td class="px-4 py-2"><a href="tel:${phone}" class="text-emerald-600">📞 ${phone}</a></td>
            <td class="px-4 py-2">${dept}</td>
            <td class="px-4 py-2">${fullName}</td>
            <td class="px-4 py-2">${role}</td>
          </tr>`;
      }).join('');

      section.innerHTML = `
        <h2>${center}</h2>
        <div class="overflow-x-auto bg-white rounded shadow mb-6">
          <table class="min-w-full border-collapse sortable-table">
            <thead class="bg-emerald-600 text-white">
              <tr>
                <th class="px-4 py-2" data-col="0">Phone <span class="sort-arrow"></span></th>
                <th class="px-4 py-2" data-col="1">Department <span class="sort-arrow"></span></th>
                <th class="px-4 py-2" data-col="2">Assignee <span class="sort-arrow"></span></th>
                <th class="px-4 py-2" data-col="3">Role <span class="sort-arrow"></span></th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>`;
      container.appendChild(section);
    }

    allRows = Array.from(document.querySelectorAll('.data-row'));
    enableSorting();

  } catch (error) {
    container.innerHTML = `<p class="no-results">Failed to load data: ${error.message}</p>`;
    console.error(error);
  }
}

function filterData() {
  const term = normalize(document.getElementById('searchInput').value);
  if (!term) { allRows.forEach(r => r.style.display=''); document.querySelectorAll('section.center-group').forEach(s=>s.style.display=''); document.querySelectorAll('.no-results-message').forEach(m=>m.remove()); return; }

  let anyVisible=false;
  allRows.forEach(row => {
    const match=row.dataset.search.includes(term);
    row.style.display = match?'':'none';
    if(match) anyVisible=true;
  });

  document.querySelectorAll('section.center-group').
