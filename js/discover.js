const apiKey = '4573eaa5baa0da8e3930d9cedca27140';
const searchInput = document.getElementById('searchInput');

document.addEventListener("DOMContentLoaded", () => {
  fetchTrending();
  fetchPopularMovies();
  fetchPopularTV();
  fetchUpcomingMovies();
  fetchTopRated();
  
  // Initialize scroll progress bars
  initializeScrollProgress();
});

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.trim();
  if (query) {
    searchAll(query);
  } else {
    // Reset to original content if search is cleared
    showAllSections();
    fetchTrending();
    fetchPopularMovies();
    fetchPopularTV();
    fetchUpcomingMovies();
    fetchTopRated();
  }
});

async function searchAll(query) {
  try {
    const [moviesRes, tvRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=en-US&page=1`),
      fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${query}&language=en-US&page=1`)
    ]);

    const [moviesData, tvData] = await Promise.all([moviesRes.json(), tvRes.json()]);
    
    // Combine and sort results by popularity
    const combinedResults = [...moviesData.results, ...tvData.results]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10);

    // Hide all sections first
    document.querySelectorAll('.discover-section').forEach(section => {
      section.style.display = 'none';
    });

    // Show and update trending section with search results
    const trendingSection = document.querySelector('.discover-section');
    trendingSection.style.display = 'block';
    
    if (combinedResults.length === 0) {
      trendingSection.innerHTML = `
        <h2>Search Results</h2>
        <div class="no-results">
          <i class="bi bi-search"></i>
          <p>No results found for "${query}"</p>
        </div>
      `;
      document.querySelector('.no-results').style.display = 'block';
    } else {
      trendingSection.innerHTML = `
        <h2>Search Results</h2>
        <div class="content-grid" id="trendingContent"></div>
        <div class="scroll-progress">
          <div class="scroll-progress-bar"></div>
        </div>
      `;
      displayContent(combinedResults, 'trendingContent');
      initializeScrollProgress();
    }
  } catch (error) {
    console.error('Error searching:', error);
  }
}

async function fetchTrending() {
  const res = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&language=en-US`);
  const data = await res.json();
  displayContent(data.results, 'trendingContent');
  document.querySelector('.discover-section h2').textContent = 'Trending Now';
}

async function fetchPopularMovies() {
  const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
  const data = await res.json();
  displayContent(data.results, 'popularMovies');
}

async function fetchPopularTV() {
  const res = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`);
  const data = await res.json();
  displayContent(data.results, 'popularTV');
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

function displayContent(items, containerId) {
  const container = document.getElementById(containerId);
  const progressBar = container.parentElement.querySelector('.scroll-progress');
  
  // Clear only the content, not the container itself
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  items.slice(0, 10).forEach(item => {
    if (!item.poster_path) return;

    const card = document.createElement('div');
    card.className = 'content-card';

    const poster = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    const title = item.title || item.name;
    const id = item.id;
    const overview = encodeURIComponent(item.overview || '');
    const release = encodeURIComponent(item.release_date || item.first_air_date || '');
    const type = item.media_type || (item.title ? 'movie' : 'tv');
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

    card.innerHTML = `
      <img src="${poster}" alt="${title}" />
      <div class="info">
        <h5>${title}</h5>
        <div class="rating">
          <i class="bi bi-star-fill"></i>
          <span>${rating}/10</span>
        </div>
        <p>${type === 'movie' ? 'Movie' : 'TV Show'}</p>
      </div>
    `;

    card.onclick = () => {
      const url = type === 'movie' 
        ? `watch.html?id=${id}&title=${encodeURIComponent(title)}&poster=${encodeURIComponent(poster)}&overview=${overview}&release=${release}`
        : `tv-watch.html?id=${id}&title=${encodeURIComponent(title)}&poster=${encodeURIComponent(poster)}&overview=${overview}&release=${release}`;
      window.location.href = url;
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

// Add function to show all sections when search is cleared
function showAllSections() {
  document.querySelectorAll('.discover-section').forEach(section => {
    section.style.display = 'block';
    const noResults = section.querySelector('.no-results');
    if (noResults) {
      noResults.style.display = 'none';
    }
  });
} 