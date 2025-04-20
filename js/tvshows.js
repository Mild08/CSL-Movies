const apiKey = '4573eaa5baa0da8e3930d9cedca27140';
const searchInput = document.getElementById('searchInput');

document.addEventListener("DOMContentLoaded", () => {
  fetchPopularTV();
  fetchAiringTV();
  initializeScrollProgress();
});

async function fetchPopularTV() {
  const res = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`);
  const data = await res.json();
  displayContent(data.results, 'popularTV');
}

async function fetchAiringTV() {
  const res = await fetch(`https://api.themoviedb.org/3/tv/airing_today?api_key=${apiKey}&language=en-US&page=1`);
  const data = await res.json();
  displayContent(data.results, 'airingTV');
}

async function searchTV(query) {
  const res = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${query}&language=en-US&page=1`);
  const data = await res.json();
  
  // Hide all sections first
  document.querySelectorAll('.discover-section').forEach(section => {
    section.style.display = 'none';
  });

  // Show and update popular TV section with search results
  const popularSection = document.querySelector('.discover-section');
  popularSection.style.display = 'block';
  
  if (data.results.length === 0) {
    popularSection.innerHTML = `
      <h2>Search Results</h2>
      <div class="no-results">
        <i class="bi bi-search"></i>
        <p>No TV shows found for "${query}"</p>
      </div>
    `;
    document.querySelector('.no-results').style.display = 'block';
  } else {
    popularSection.innerHTML = `
      <h2>Search Results</h2>
      <div class="content-grid" id="popularTV"></div>
      <div class="scroll-progress">
        <div class="scroll-progress-bar"></div>
      </div>
    `;
    displayContent(data.results, 'popularTV');
    initializeScrollProgress();
  }
}

function displayContent(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  items.slice(0, 10).forEach(item => {
    if (!item.poster_path) return;

    const card = document.createElement('div');
    card.className = 'content-card';

    const poster = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    const title = encodeURIComponent(item.name);
    const id = item.id;
    const overview = encodeURIComponent(item.overview || '');
    const release = encodeURIComponent(item.first_air_date || '');
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

    card.innerHTML = `
      <img src="${poster}" alt="${item.name}" />
      <div class="info">
        <h5>${item.name}</h5>
        <div class="rating">
          <i class="bi bi-star-fill"></i>
          <span>${rating}/10</span>
        </div>
      </div>
    `;

    card.onclick = () => {
      window.location.href = `tv-watch.html?id=${id}&title=${title}&poster=${encodeURIComponent(poster)}&overview=${overview}&release=${release}`;
    };

    container.appendChild(card);
  });
}

function initializeScrollProgress() {
  const contentGrids = document.querySelectorAll('.content-grid');
  
  contentGrids.forEach(grid => {
    const progressBar = grid.parentElement.querySelector('.scroll-progress-bar');
    
    grid.addEventListener('scroll', () => {
      const scrollWidth = grid.scrollWidth - grid.clientWidth;
      const scrolled = (grid.scrollLeft / scrollWidth) * 100;
      progressBar.style.width = `${scrolled}%`;
    });
  });
}

function showAllSections() {
  document.querySelectorAll('.discover-section').forEach(section => {
    section.style.display = 'block';
    const noResults = section.querySelector('.no-results');
    if (noResults) {
      noResults.style.display = 'none';
    }
  });
}

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.trim();
  if (query) {
    searchTV(query);
  } else {
    showAllSections();
    fetchPopularTV();
    fetchAiringTV();
  }
}); 