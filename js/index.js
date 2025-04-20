const apiKey = '4573eaa5baa0da8e3930d9cedca27140';
const searchInput = document.getElementById('searchInput');

document.addEventListener("DOMContentLoaded", () => {
  fetchPopularMovies();
  fetchUpcomingMovies();
  fetchTopRated();
  initializeScrollProgress();
});

async function fetchPopularMovies() {
  const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
  const data = await res.json();
  displayContent(data.results, 'popularMovies');
}

async function fetchUpcomingMovies() {
  const res = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`);
  const data = await res.json();
  displayContent(data.results, 'upcomingMovies');
}

async function fetchTopRated() {
  const res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`);
  const data = await res.json();
  displayContent(data.results, 'topRated');
}

async function searchMovies(query) {
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=en-US&page=1`);
  const data = await res.json();
  
  // Hide all sections first
  document.querySelectorAll('.discover-section').forEach(section => {
    section.style.display = 'none';
  });

  // Show and update popular movies section with search results
  const popularSection = document.querySelector('.discover-section');
  popularSection.style.display = 'block';
  
  if (data.results.length === 0) {
    popularSection.innerHTML = `
      <h2>Search Results</h2>
      <div class="no-results">
        <i class="bi bi-search"></i>
        <p>No movies found for "${query}"</p>
      </div>
    `;
    document.querySelector('.no-results').style.display = 'block';
  } else {
    popularSection.innerHTML = `
      <h2>Search Results</h2>
      <div class="content-grid" id="popularMovies"></div>
      <div class="scroll-progress">
        <div class="scroll-progress-bar"></div>
      </div>
    `;
    displayContent(data.results, 'popularMovies');
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
    const title = encodeURIComponent(item.title);
    const id = item.id;
    const overview = encodeURIComponent(item.overview || '');
    const release = encodeURIComponent(item.release_date || '');
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

    card.innerHTML = `
      <img src="${poster}" alt="${item.title}" />
      <div class="info">
        <h5>${item.title}</h5>
        <div class="rating">
          <i class="bi bi-star-fill"></i>
          <span>${rating}/10</span>
        </div>
      </div>
    `;

    card.onclick = () => {
      window.location.href = `watch.html?id=${id}&title=${title}&poster=${encodeURIComponent(poster)}&overview=${overview}&release=${release}`;
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
    searchMovies(query);
  } else {
    showAllSections();
    fetchPopularMovies();
    fetchUpcomingMovies();
    fetchTopRated();
  }
}); 