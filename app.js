// GMTK Video Game History - Interactive Web Application

const STATE = {
  summary: [],
  yearlyCounts: {},
  compactGames: [],
  gamesByGenreYear: {},
  currentYear: 2002,
  selectedCompareGenres: ['Platformer', 'First-Person Shooter', 'Action-Adventure', 'Fighting', 'Shoot \'em up'],
  activeTab: 'gallery',
  sortOption: 'video-order',
  searchQuery: '',
  charts: {}
};

// Chronological order as introduced in Mark Brown's GMTK video
const VIDEO_ORDER = [
  'Racing',
  'Pinball',
  'Light Gun',
  'Sports',
  'Action',
  'Shoot \'em up',
  'Maze',
  'Platformer',
  'Beat \'em up',
  'Fighting',
  'Hack and Slash',
  'Run and Gun',
  'Top-Down Shooter',
  'First-Person Shooter',
  'Third-Person Shooter',
  'Rhythm',
  'Puzzle',
  'Turn-Based Strategy',
  'Real-Time Strategy',
  'Management Simulation',
  'Life Simulation',
  'Vehicle Simulation',
  'Computer Role-Playing',
  'Japanese Role-Playing',
  'Action Role-Playing',
  'Adventure',
  'Visual Novel',
  'Interactive Drama',
  'Walking Simulator',
  'Action-Adventure',
  'Horror',
  'Roguelike',
  'Incremental',
  'Sandbox',
  'Survival',
  'Party / Minigame'
];

// Genre Color Palette
const PALETTE = [
  '#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#9b59b6',
  '#00d2d3', '#ff6b81', '#70a1ff', '#2bcbba', '#eb4d4b',
  '#686de0', '#e056fd', '#badc58', '#f0932b', '#22a6b3',
  '#4834d4', '#be2edd', '#6ab04c', '#30336b', '#130f40'
];

function getGenreColor(idx) {
  return PALETTE[idx % PALETTE.length];
}

// Initial Data Load
async function initApp() {
  try {
    const [summaryRes, countsRes, gamesRes, byGenreRes] = await Promise.all([
      fetch('./data/genre_summary.json').then(r => r.json()),
      fetch('./data/genre_yearly_counts.json').then(r => r.json()),
      fetch('./data/games_compact.json').then(r => r.json()),
      fetch('./data/games_by_genre_year.json').then(r => r.json())
    ]);

    STATE.summary = summaryRes;
    STATE.yearlyCounts = countsRes;
    STATE.compactGames = gamesRes;
    STATE.gamesByGenreYear = byGenreRes;

    setupNavTabs();
    setupGalleryControls();
    setupYearScrubber();
    setupCompareView();
    setupGameSearch();
    renderGallery();
    renderYearView(STATE.currentYear);
    renderCompareChart();

  } catch (err) {
    console.error('Error loading data:', err);
    document.getElementById('loading-indicator').innerHTML = `
      <p style="color: #ff4757; font-weight: bold;">Failed to load dataset files.</p>
      <p style="font-size: 0.85rem; color: #8c96ac;">Ensure you are serving the site over HTTP/HTTPS or GitHub Pages.</p>
    `;
  }
}

// Setup Navigation Tabs
function setupNavTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      STATE.activeTab = target;

      tabBtns.forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.tab-view').forEach(v => {
        v.classList.toggle('active', v.id === `tab-${target}`);
      });

      if (target === 'compare') {
        renderCompareChart();
      } else if (target === 'timeline') {
        renderYearView(STATE.currentYear);
      }
    });
  });
}

// Setup Gallery Controls
function setupGalleryControls() {
  const searchInput = document.getElementById('genre-search-input');
  const sortSelect = document.getElementById('genre-sort-select');

  searchInput.addEventListener('input', (e) => {
    STATE.searchQuery = e.target.value.toLowerCase().trim();
    renderGallery();
  });

  sortSelect.addEventListener('change', (e) => {
    STATE.sortOption = e.target.value;
    renderGallery();
  });
}

// Render Gallery Grid
function renderGallery() {
  const grid = document.getElementById('genre-grid');
  grid.innerHTML = '';

  let filtered = STATE.summary.filter(g => 
    g.genre.toLowerCase().includes(STATE.searchQuery)
  );

  // Sort
  if (STATE.sortOption === 'video-order') {
    filtered.sort((a, b) => {
      const idxA = VIDEO_ORDER.indexOf(a.genre);
      const idxB = VIDEO_ORDER.indexOf(b.genre);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  } else if (STATE.sortOption === 'total-desc') {
    filtered.sort((a, b) => b.totalGames - a.totalGames);
  } else if (STATE.sortOption === 'total-asc') {
    filtered.sort((a, b) => a.totalGames - b.totalGames);
  } else if (STATE.sortOption === 'peak-desc') {
    filtered.sort((a, b) => b.peakYear - a.peakYear);
  } else if (STATE.sortOption === 'peak-asc') {
    filtered.sort((a, b) => a.peakYear - b.peakYear);
  } else if (STATE.sortOption === 'alpha') {
    filtered.sort((a, b) => a.genre.localeCompare(b.genre));
  }

  document.getElementById('genre-count-label').textContent = `${filtered.length} of ${STATE.summary.length} genres`;

  const years = Array.from({ length: 51 }, (_, i) => 1975 + i);

  filtered.forEach((g, idx) => {
    const card = document.createElement('div');
    card.className = 'genre-card';
    card.addEventListener('click', () => openGenreModal(g));

    const color = getGenreColor(idx);

    card.innerHTML = `
      <div class="genre-card-header">
        <h3 class="genre-card-title">${g.genre}</h3>
        <span class="peak-badge">Peak: ${g.peakYear} (${g.peakCount})</span>
      </div>
      <div class="genre-card-stats">
        <span><strong>${g.totalGames}</strong> games</span>
        <span><strong>${((g.totalGames / (STATE.compactGames.length || 9608)) * 100).toFixed(1)}%</strong> of dataset</span>
      </div>
      <div class="genre-sparkline-wrapper">
        <canvas id="sparkline-${idx}"></canvas>
      </div>
      <div class="genre-card-footer">
        <span>Click for details & games</span>
        ${g.videoTimestamp ? `<span>Video: ${g.videoTimestamp}</span>` : ''}
      </div>
    `;

    grid.appendChild(card);

    // Create Sparkline Chart with straight segmented lines and visible axes
    const ctx = document.getElementById(`sparkline-${idx}`).getContext('2d');
    const dataPoints = years.map(y => g.history[y] || 0);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          data: dataPoints,
          borderColor: color,
          backgroundColor: `${color}18`,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: true,
          tension: 0 // straight segmented line, no wobbly bezier
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `Year: ${items[0].label}`,
              label: (item) => `${item.raw} games`
            }
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.04)',
              drawTicks: false
            },
            ticks: {
              color: '#8c96ac',
              font: { size: 10 },
              maxTicksLimit: 6,
              maxRotation: 0
            }
          },
          y: {
            display: true,
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.04)',
              drawTicks: false
            },
            ticks: {
              color: '#8c96ac',
              font: { size: 10 },
              precision: 0,
              maxTicksLimit: 4
            }
          }
        }
      }
    });
  });
}

// Genre Modal
let modalChartInstance = null;
function openGenreModal(g) {
  const modal = document.getElementById('genre-modal');
  document.getElementById('modal-genre-title').textContent = g.genre;
  document.getElementById('modal-genre-stats').textContent = 
    `Total: ${g.totalGames} games • Peak: ${g.peakYear} (${g.peakCount} games) • ${((g.totalGames / (STATE.compactGames.length || 9608)) * 100).toFixed(1)}% of all games`;
  
  const quoteEl = document.getElementById('modal-video-quote');
  if (g.commentary) {
    quoteEl.style.display = 'block';
    quoteEl.innerHTML = `<strong>GMTK Commentary:</strong> "${g.commentary}" ${g.videoTimestamp ? `<em>(${g.videoTimestamp})</em>` : ''}`;
  } else {
    quoteEl.style.display = 'none';
  }

  // Render modal chart
  const years = Array.from({ length: 51 }, (_, i) => 1975 + i);
  const dataPoints = years.map(y => g.history[y] || 0);
  const ctx = document.getElementById('modal-chart-canvas').getContext('2d');

  if (modalChartInstance) modalChartInstance.destroy();

  modalChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: `${g.genre} Releases`,
        data: dataPoints,
        borderColor: '#ff4757',
        backgroundColor: 'rgba(255, 71, 87, 0.15)',
        borderWidth: 2.5,
        fill: true,
        tension: 0,
        pointBackgroundColor: '#ff4757',
        pointRadius: 3,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => `${item.raw} games (Click year to view)`
          }
        }
      },
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const selectedYear = years[index];
          renderModalGames(g.genre, selectedYear);
        }
      },
      scales: {
        x: {
          grid: { color: '#262c3e' },
          ticks: { color: '#8c96ac' }
        },
        y: {
          grid: { color: '#262c3e' },
          ticks: { color: '#8c96ac' },
          min: 0
        }
      }
    }
  });

  // Load games for peak year by default
  renderModalGames(g.genre, g.peakYear);

  modal.classList.add('open');
}

function renderModalGames(genre, year) {
  const container = document.getElementById('modal-games-list');
  const titleEl = document.getElementById('modal-games-title');
  titleEl.innerHTML = `Top ${genre} Games in <strong>${year}</strong> <span style="font-size:0.8rem; font-weight:normal; color:#8c96ac;">(Click chart points to change year)</span>`;
  container.innerHTML = '';

  const genreGamesInYear = STATE.gamesByGenreYear[genre]?.[year] || [];
  if (genreGamesInYear.length === 0) {
    container.innerHTML = `<p style="color: #8c96ac; font-size: 0.9rem;">No games recorded for this genre in ${year}.</p>`;
    return;
  }

  genreGamesInYear.slice(0, 18).forEach(game => {
    const card = document.createElement('a');
    card.className = 'game-item-card';
    card.href = `https://backloggd.com${game.s}`;
    card.target = '_blank';
    card.rel = 'noopener';

    const coverSrc = game.c ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.c}` : 'https://placehold.co/150x200/181c28/8c96ac?text=No+Cover';

    card.innerHTML = `
      <img class="game-item-cover" src="${coverSrc}" alt="${game.t}" loading="lazy" onerror="this.src='https://placehold.co/150x200/181c28/8c96ac?text=Game'">
      <div class="game-item-info">
        <span class="game-item-rank">#${game.r} in ${year}</span>
        <span class="game-item-title" title="${game.t}">${game.t}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

document.getElementById('modal-close-btn').addEventListener('click', () => {
  document.getElementById('genre-modal').classList.remove('open');
});

document.getElementById('genre-modal').addEventListener('click', (e) => {
  if (e.target.id === 'genre-modal') {
    e.target.classList.remove('open');
  }
});

// Setup Year Scrubber
let yearBreakdownChart = null;
function setupYearScrubber() {
  const slider = document.getElementById('year-slider');
  slider.addEventListener('input', (e) => {
    const y = parseInt(e.target.value);
    STATE.currentYear = y;
    renderYearView(y);
  });
}

function renderYearView(year) {
  document.getElementById('current-year-number').textContent = year;
  document.getElementById('year-slider').value = year;

  // Games for this year
  const gamesThisYear = STATE.compactGames.filter(g => g.y === year);
  document.getElementById('year-games-count').textContent = `${gamesThisYear.length} games tracked in ${year}`;

  // Genre breakdown for this year: sorted descending from most games (top) to least games (bottom)
  const countsThisYear = STATE.yearlyCounts[year] || {};
  const genreEntries = Object.entries(countsThisYear)
    .filter(([_, c]) => c > 0)
    .sort((a, b) => b[1] - a[1]);

  const badge = document.getElementById('year-active-genres-badge');
  if (badge) {
    badge.textContent = `${genreEntries.length} active genres`;
  }

  const canvas = document.getElementById('year-breakdown-canvas');
  const ctx = canvas.getContext('2d');
  if (yearBreakdownChart) yearBreakdownChart.destroy();

  // Dynamic height so each horizontal bar and its label has comfortable height and spacing
  const chartWrapper = document.getElementById('year-chart-wrapper');
  const barSpacing = 28;
  const computedHeight = Math.max(320, genreEntries.length * barSpacing + 40);
  if (chartWrapper) {
    chartWrapper.style.height = `${computedHeight}px`;
  }

  const maxVal = Math.max(...genreEntries.map(g => g[1]), 1);

  yearBreakdownChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: genreEntries.map(g => g[0]),
      datasets: [{
        label: 'Games',
        data: genreEntries.map(g => g[1]),
        backgroundColor: genreEntries.map(g => getGenreColor(VIDEO_ORDER.indexOf(g[0]))),
        hoverBackgroundColor: '#ffffff',
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.72,
        categoryPercentage: 0.88
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      onClick: (evt, elements) => {
        if (elements && elements.length > 0) {
          const idx = elements[0].index;
          const genreName = genreEntries[idx][0];
          const genreData = STATE.summary.find(s => s.genre === genreName);
          if (genreData) openGenreModal(genreData);
        }
      },
      onHover: (evt, elements) => {
        evt.native.target.style.cursor = elements.length ? 'pointer' : 'default';
      },
      layout: {
        padding: { right: 55, top: 4, bottom: 4, left: 0 }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(19, 23, 34, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#f0f3fa',
          borderColor: '#2a2e39',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.raw} games (${Math.round((ctx.raw / (gamesThisYear.length || 1)) * 100)}% of this year)`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: { color: '#8c96ac', font: { size: 10 }, precision: 0 },
          suggestedMax: Math.ceil(maxVal * 1.15)
        },
        y: {
          grid: { display: false },
          ticks: {
            color: '#f0f3fa',
            font: { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' }
          }
        }
      }
    },
    plugins: [{
      id: 'barCounts',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((bar, index) => {
          const val = chart.data.datasets[0].data[index];
          ctx.save();
          ctx.font = 'bold 11px Inter, system-ui, sans-serif';
          ctx.fillStyle = '#a0aec0';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${val}`, bar.x + 8, bar.y);
          ctx.restore();
        });
      }
    }]
  });

  // Top Games grid
  const gamesGrid = document.getElementById('year-games-grid');
  gamesGrid.innerHTML = '';

  gamesThisYear.slice(0, 24).forEach(game => {
    const card = document.createElement('a');
    card.className = 'game-item-card';
    card.href = `https://backloggd.com${game.s}`;
    card.target = '_blank';
    card.rel = 'noopener';

    const coverSrc = game.c ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.c}` : 'https://placehold.co/150x200/181c28/8c96ac?text=No+Cover';

    card.innerHTML = `
      <img class="game-item-cover" src="${coverSrc}" alt="${game.t}" loading="lazy" onerror="this.src='https://placehold.co/150x200/181c28/8c96ac?text=Game'">
      <div class="game-item-info">
        <span class="game-item-rank">#${game.r} in ${year}</span>
        <span class="game-item-title" title="${game.t}">${game.t}</span>
        <span style="font-size: 0.68rem; color: #00d2d3; margin-top: auto;">${(game.g || []).slice(0, 1).join(', ')}</span>
      </div>
    `;
    gamesGrid.appendChild(card);
  });
}

// Setup Compare View
let compareChartInstance = null;
function setupCompareView() {
  const container = document.getElementById('compare-chips-container');
  container.innerHTML = '';

  STATE.summary.forEach((g, idx) => {
    const chip = document.createElement('div');
    chip.className = `compare-chip ${STATE.selectedCompareGenres.includes(g.genre) ? 'selected' : ''}`;
    chip.textContent = g.genre;
    chip.addEventListener('click', () => {
      if (STATE.selectedCompareGenres.includes(g.genre)) {
        if (STATE.selectedCompareGenres.length > 1) {
          STATE.selectedCompareGenres = STATE.selectedCompareGenres.filter(name => name !== g.genre);
          chip.classList.remove('selected');
        }
      } else {
        if (STATE.selectedCompareGenres.length < 8) {
          STATE.selectedCompareGenres.push(g.genre);
          chip.classList.add('selected');
        } else {
          alert('You can compare up to 8 genres simultaneously.');
        }
      }
      renderCompareChart();
    });
    container.appendChild(chip);
  });
}

function renderCompareChart() {
  const years = Array.from({ length: 51 }, (_, i) => 1975 + i);
  const datasets = STATE.selectedCompareGenres.map((genreName, idx) => {
    const gData = STATE.summary.find(s => s.genre === genreName);
    const color = getGenreColor(idx);
    const dataPoints = years.map(y => gData?.history?.[y] || 0);

    return {
      label: genreName,
      data: dataPoints,
      borderColor: color,
      backgroundColor: `${color}15`,
      borderWidth: 2.5,
      tension: 0,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 5
    };
  });

  const ctx = document.getElementById('compare-chart-canvas').getContext('2d');
  if (compareChartInstance) compareChartInstance.destroy();

  compareChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels: years, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#f0f3fa', boxWidth: 14 }
        },
        tooltip: {
          callbacks: {
            title: (items) => `Year: ${items[0].label}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#262c3e' },
          ticks: { color: '#8c96ac' }
        },
        y: {
          grid: { color: '#262c3e' },
          ticks: { color: '#8c96ac' },
          min: 0,
          title: {
            display: true,
            text: 'Number of Top 200 Games Released',
            color: '#8c96ac'
          }
        }
      }
    }
  });
}

// Setup Game Search View
function setupGameSearch() {
  const searchInput = document.getElementById('db-search-input');
  const resultsContainer = document.getElementById('db-search-results');
  const countLabel = document.getElementById('db-search-count');

  function performSearch() {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
      resultsContainer.innerHTML = `<p style="color: #8c96ac; padding: 20px;">Type a title above to search through all ${(STATE.compactGames.length || 9608).toLocaleString()} games from 1975 to 2025.</p>`;
      countLabel.textContent = '';
      return;
    }

    const matches = STATE.compactGames.filter(g => g.t.toLowerCase().includes(q)).slice(0, 48);
    countLabel.textContent = `Showing top ${matches.length} matching games`;

    resultsContainer.innerHTML = '';
    if (matches.length === 0) {
      resultsContainer.innerHTML = '<p style="color: #8c96ac; padding: 20px;">No games found matching your search.</p>';
      return;
    }

    matches.forEach(game => {
      const card = document.createElement('a');
      card.className = 'game-item-card';
      card.href = `https://backloggd.com${game.s}`;
      card.target = '_blank';
      card.rel = 'noopener';

      const coverSrc = game.c ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.c}` : 'https://placehold.co/150x200/181c28/8c96ac?text=No+Cover';

      card.innerHTML = `
        <img class="game-item-cover" src="${coverSrc}" alt="${game.t}" loading="lazy" onerror="this.src='https://placehold.co/150x200/181c28/8c96ac?text=Game'">
        <div class="game-item-info">
          <span class="game-item-rank">${game.y} • Rank #${game.r}</span>
          <span class="game-item-title" title="${game.t}">${game.t}</span>
          <span style="font-size: 0.68rem; color: #00d2d3; margin-top: auto;">${(game.g || []).join(', ')}</span>
        </div>
      `;
      resultsContainer.appendChild(card);
    });
  }

  searchInput.addEventListener('input', performSearch);
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
