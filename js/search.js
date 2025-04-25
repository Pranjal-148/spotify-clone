
let debounceTimeout;
let spotifyAudio = null;
let isServerRunning = false;
const MAX_RESULTS = 7; 

// Clear search function
function clearSearch() {
  document.getElementById("searchInput").value = "";
  document.querySelector(".spotifySongs").innerHTML = "";
  document.querySelector(".search-results-title").style.display = "none";
  document.querySelector(".clear-search").style.display = "none";
}

// Check if Spotify server is running
async function checkServerConnection() {
  try {
    const res = await fetch('http://localhost:3001/api/spotify-token', { 
      method: 'GET',
      timeout: 2000 // 2 second timeout
    });
    isServerRunning = res.ok;
    return res.ok;
  } catch (err) {
    console.error('Spotify token server not running:', err);
    isServerRunning = false;
    return false;
  }
}

// Fetch Spotify Token with better error handling
async function fetchSpotifyToken() {
  try {
    const res = await fetch('http://localhost:3001/api/spotify-token');
    if (!res.ok) {
      throw new Error(`Server responded with status: ${res.status}`);
    }
    const data = await res.json();
    return data.access_token;
  } catch (err) {
    console.error('Failed to fetch Spotify token:', err);
    showError('Could not connect to Spotify service. Please make sure the token server is running.');
    return null;
  }
}

// Search Spotify Tracks with better error handling
async function searchSpotifyTracks(query) {
  try {
    // Check server connection first
    if (!isServerRunning && !(await checkServerConnection())) {
      showError('Spotify service is not available. Please start the token server.');
      return [];
    }
    
    const token = await fetchSpotifyToken();
    if (!token) return [];

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${MAX_RESULTS}`,
      {
        headers: { 'Authorization': 'Bearer ' + token }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify search failed', errorText);
      showError('Failed to search Spotify. Please try again later.');
      return [];
    }

    const data = await response.json();
    return data.tracks.items;
  } catch (err) {
    console.error('Error searching Spotify:', err);
    showError('An error occurred while searching. Please try again.');
    return [];
  }
}

// Show error message to user
function showError(message) {
  const resultsTitle = document.querySelector(".search-results-title");
  const spotifySongsUL = document.querySelector(".spotifySongs");
  
  resultsTitle.style.display = 'block';
  spotifySongsUL.innerHTML = `<li class="error-message">${message}</li>`;
}

// Render Spotify Search Results
function renderSpotifySongs(tracks) {
  const resultsTitle = document.querySelector(".search-results-title");
  const spotifySongsUL = document.querySelector(".spotifySongs");
  const clearButton = document.querySelector(".clear-search");
  
  // Show clear button if we have a search
  clearButton.style.display = tracks.length > 0 ? 'flex' : 'none';
  
  resultsTitle.style.display = tracks.length > 0 ? 'block' : 'none';
  spotifySongsUL.innerHTML = "";

  if (tracks.length === 0) {
    spotifySongsUL.innerHTML = "<li class='no-results'>No songs found. Try another search.</li>";
    return;
  }

  // Limit to MAX_RESULTS results
  const displayTracks = tracks.slice(0, MAX_RESULTS);

  displayTracks.forEach(track => {
    spotifySongsUL.innerHTML += `
      <li data-preview="${track.preview_url || ''}">
        <img src="${track.album.images[2]?.url || 'img/music.svg'}" width="34" alt="">
        <div class="info">
          <div>${track.name}</div>
          <div>${track.artists.map(a => a.name).join(', ')}</div>
        </div>
        <div class="playnow">
          <span>Preview</span>
          <img class="invert" src="img/play.svg" alt="">
        </div>
      </li>`;
  });

  if (tracks.length > MAX_RESULTS) {
    spotifySongsUL.innerHTML += `<li class="more-results">Showing ${MAX_RESULTS} of ${tracks.length} results. Refine your search for more specific results.</li>`;
  }

  attachSpotifyPlayListeners();
}

// Attach click listeners for Play Now
function attachSpotifyPlayListeners() {
  const items = document.querySelectorAll(".spotifySongs li");

  items.forEach(li => {
    if (li.classList.contains('more-results') || li.classList.contains('no-results') || li.classList.contains('error-message')) {
      return; // Skip special message items
    }
    
    const playButton = li.querySelector('.playnow');
    if (!playButton) return;
    
    playButton.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent any parent handlers from firing
      const previewUrl = li.getAttribute('data-preview');
      
      if (previewUrl) {
        playSpotifyPreview(previewUrl, playButton);
      } else {
        alert("No preview available for this song.");
      }
    });
    
    // Make the whole li clickable
    li.addEventListener('click', function(e) {
      if (!e.target.closest('.playnow')) {
        const previewUrl = li.getAttribute('data-preview');
        if (previewUrl) {
          playSpotifyPreview(previewUrl, playButton);
        }
      }
    });
  });
}

// Play 30s Spotify Preview with play/pause toggle
function playSpotifyPreview(url, buttonElement) {
  // If something is already playing, pause it first
  if (spotifyAudio && !spotifyAudio.paused) {
    spotifyAudio.pause();
    // Reset all play buttons
    document.querySelectorAll('.spotifySongs .playnow img').forEach(img => {
      img.src = 'img/play.svg';
    });
    
    // If clicking the same song, just stop it
    if (spotifyAudio.src === url) {
      spotifyAudio = null;
      return;
    }
  }
  
  // Play the new song
  spotifyAudio = new Audio(url);
  spotifyAudio.play();
  
  // Change button to pause icon
  const playIcon = buttonElement.querySelector('img');
  if (playIcon) {
    playIcon.src = 'img/pause.svg';
  }
  
  // When preview ends, reset the button
  spotifyAudio.onended = function() {
    if (playIcon) {
      playIcon.src = 'img/play.svg';
    }
  };
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;
  
  // Create the clear button if it doesn't exist
  if (!document.querySelector('.clear-search')) {
    const searchBar = document.querySelector('.search-bar');
    const clearButton = document.createElement('button');
    clearButton.className = 'clear-search';
    clearButton.innerHTML = '×';
    clearButton.style.display = 'none';
    clearButton.addEventListener('click', clearSearch);
    searchBar.appendChild(clearButton);
  }
  
  // Create the search results container if it doesn't exist
  if (!document.querySelector('.spotify-search-results')) {
    const rightDiv = document.querySelector('.right');
    const spotifyPlaylists = document.querySelector('.spotifyPlaylists');
    
    const searchResults = document.createElement('div');
    searchResults.className = 'spotify-search-results';
    searchResults.innerHTML = `
      <h2 class="search-results-title" style="display: none;">Search Results</h2>
      <ul class="spotifySongs"></ul>
    `;
    
    // Insert the search results before the playlists section
    spotifyPlaylists.insertBefore(searchResults, spotifyPlaylists.firstChild);
  }
  
  // Check server connection on page load
  checkServerConnection();
  
  searchInput.addEventListener("input", function(e) {
    clearTimeout(debounceTimeout);
    const query = e.target.value.trim();
    
    // Toggle clear button visibility
    const clearButton = document.querySelector('.clear-search');
    if (clearButton) {
      clearButton.style.display = query ? 'flex' : 'none';
    }
    
    // Show "Search Results" title when typing
    const resultsTitle = document.querySelector(".search-results-title");
    if (resultsTitle) {
      resultsTitle.style.display = query ? 'block' : 'none';
      resultsTitle.textContent = query ? 'Search Results' : '';
    }
    
    debounceTimeout = setTimeout(async () => {
      if (!query) {
        document.querySelector(".spotifySongs").innerHTML = ""; // Clear if empty
        resultsTitle.style.display = 'none';
        return;
      }

      // Show loading indicator
      document.querySelector(".spotifySongs").innerHTML = "<li class='loading'>Searching...</li>";
      
      const tracks = await searchSpotifyTracks(query);
      renderSpotifySongs(tracks);
    }, 400);
  });
});


