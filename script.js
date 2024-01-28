function getFaviconUrl(url) {
    let hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}`;
  }
  
  function setupTiles(data) {
    const container = document.getElementById('tiles-container');
    container.innerHTML = ''; // Leeren des Containers vor dem Hinzufügen neuer Tiles
    data.forEach(link => {
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
        if (!searchTerm) {
          setupTiles(data);
          return;
        }
        const filteredData = data.filter(link => {
          const inTitle = link.title.toLowerCase().includes(searchTerm.toLowerCase());
          const inTags = searchTerm.startsWith('#') && link.tags && link.tags.includes(searchTerm.slice(1).toLowerCase());
          return inTitle || inTags;
        });
        setupTiles(filteredData);
      })
      .catch(error => console.error('Fehler beim Filtern der Tiles:', error));
  }
  
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
    fetch('links.json')
      .then(response => response.json())
      .then(data => {
        setupTiles(data);
        applySavedTheme();
      })
      .catch(error => console.error('Fehler beim Laden der Tiles:', error));
  
    setupSettingsMenu();
  
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
      filterTiles(searchInput.value);
    });
  
    updateClock();
    setInterval(updateClock, 1000);
  });
  