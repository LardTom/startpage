function getFaviconUrl(url) {
  let hostname = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?domain=${hostname}`;
}

function setupTiles(data, showHidden = false) {
  const container = document.getElementById('tiles-container');
  container.innerHTML = '';
  data.forEach(link => {
    if (link.tags && link.tags.includes('hidden') && !showHidden) {
      return;
    }

    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.addEventListener('click', () => window.open(link.url, '_blank'));

    const favicon = document.createElement('img');
    favicon.src = getFaviconUrl(link.url);
    favicon.classList.add('favicon');
    favicon.alt = 'Favicon';

    const title = document.createElement('div');
    title.classList.add('tile-title');
    title.textContent = link.title;

    tile.appendChild(favicon);
    tile.appendChild(title);
    container.appendChild(tile);
  });
}

function filterTiles(searchTerm) {
  fetch('links.json')
    .then(response => response.json())
    .then(data => {
      const showHidden = searchTerm === '#hidden';
      const filteredData = data.filter(link => {
        const isHidden = link.tags && link.tags.includes('hidden');
        if (showHidden) {
          return isHidden;
        }
        if (isHidden) {
          return false;
        }
        const inTitle = searchTerm && link.title.toLowerCase().includes(searchTerm.toLowerCase());
        const inTags = searchTerm.startsWith('#') && link.tags && link.tags.includes(searchTerm.slice(1).toLowerCase());
        return inTitle || inTags;
      });
      setupTiles(filteredData, showHidden);
    })
    .catch(error => console.error('Fehler beim Filtern der Tiles:', error));
}

function collectAndDisplayTags() {
  fetch('links.json')
    .then(response => response.json())
    .then(data => {
      const allTags = new Set();
      data.forEach(link => {
        if (link.tags) {
          link.tags.forEach(tag => {
            if (tag !== 'hidden') {
              allTags.add(tag);
            }
          });
        }
      });
      // Sortiere die Tags alphabetisch und stelle sicher, dass 'all' (falls vorhanden) an erster Stelle bleibt
      const sortedTags = Array.from(allTags).sort((a, b) => {
        if (a === 'all') return -1;
        if (b === 'all') return 1;
        return a.localeCompare(b);
      });
      displayTags(sortedTags);
    })
    .catch(error => console.error('Fehler beim Laden der Tags:', error));
}

function displayTags(tags) {
  const tagsContainer = document.getElementById('tags-container');
  tagsContainer.innerHTML = '';
  tags.forEach(tag => {
    const tagElement = document.createElement('button');
    tagElement.textContent = tag;
    tagElement.onclick = () => filterTiles(`#${tag}`);
    tagsContainer.appendChild(tagElement);
  });
}

function checkLogin() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    document.getElementById('login-container').style.display = 'none';
  } else {
    document.getElementById('login-container').style.display = 'block';
  }
}

document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === 'tom' && password === 'tomisadmin') {
    localStorage.setItem('isLoggedIn', 'true');
    checkLogin();
  } else {
    alert('Falscher Benutzername oder Passwort!');
  }
});

function setupSettingsMenu() {
  const settingsIcon = document.getElementById('settings-icon');
  const settingsMenu = document.getElementById('settings-menu');

  settingsIcon.addEventListener('click', () => {
    const isDisplayed = settingsMenu.style.display === 'block';
    settingsMenu.style.display = isDisplayed ? 'none' : 'block';
  });

  const themeButtons = document.querySelectorAll('.theme-button');
  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selectedTheme = button.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', selectedTheme);
      localStorage.setItem('selectedTheme', selectedTheme);
    });
  });
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const clockElement = document.getElementById('clock');
  clockElement.textContent = `${hours}:${minutes}`;
}

document.addEventListener('DOMContentLoaded', function() {
  checkLogin();

  if (localStorage.getItem('isLoggedIn') === 'true') {
    fetch('links.json')
      .then(response => response.json())
      .then(data => {
        setupTiles(data);
        applySavedTheme();
        collectAndDisplayTags();
      })
      .catch(error => console.error('Fehler beim Laden der Tiles:', error));

    setupSettingsMenu();

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
      filterTiles(searchInput.value);
    });

    updateClock();
    setInterval(updateClock, 1000);
  }
});
