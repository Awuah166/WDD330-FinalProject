import { isFavorite, toggleFavorite } from './favorites.js';

// Coordinate mappings for Ghana locations
const locationCoordinates = {
  'Accra': { lat: 5.6037, lng: -0.1870 },
  'Kumasi': { lat: 6.6753, lng: -1.6168 },
  'Takoradi': { lat: 4.9083, lng: -1.7599 },
  'Tema': { lat: 5.7169, lng: -0.0061 }
};

function getPropertyType(name) {
  const normalized = name.toLowerCase();
  if (normalized.includes('villa')) return 'Villa';
  if (normalized.includes('apartment') || normalized.includes('condo') || normalized.includes('condominium')) return 'Apartment';
  return 'House';
}

function formatPrice(price) {
  return `$${Number(price).toLocaleString()}`;
}

async function getWeatherData(location) {
  try {
    // Extract city name from location (e.g., "Accra, Ghana" -> "Accra")
    const city = location.split(',')[0].trim();
    const coords = locationCoordinates[city];
    
    if (!coords) {
      throw new Error(`Location ${city} not found`);
    }

    // Using Open-Meteo API (free, no API key required)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&temperature_unit=celsius&timezone=auto`
    );

    if (!response.ok) throw new Error('Weather data unavailable');
    
    const data = await response.json();
    const current = data.current;

    return {
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      condition: getWeatherCondition(current.weather_code),
      code: current.weather_code
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

function getWeatherCondition(code) {
  // WMO Weather interpretation codes
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2) return 'Mostly clear';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code === 51 || code === 53 || code === 55) return 'Light rain';
  if (code === 61 || code === 63 || code === 65) return 'Rain';
  if (code === 71 || code === 73 || code === 75) return 'Snow';
  if (code === 80 || code === 81 || code === 82) return 'Heavy rain';
  if (code === 95 || code === 96 || code === 99) return 'Thunderstorm';
  return 'Variable';
}

function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code === 1 || code === 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code === 51 || code === 53 || code === 55 || code === 61 || code === 63 || code === 65) return '🌧️';
  if (code === 71 || code === 73 || code === 75) return '❄️';
  if (code === 80 || code === 81 || code === 82) return '⛈️';
  if (code === 95 || code === 96 || code === 99) return '⚡';
  return '🌡️';
}

function initializeMap(location) {
  try {
    const city = location.split(',')[0].trim();
    const coords = locationCoordinates[city];
    
    if (!coords) {
      console.warn(`Map coordinates not found for ${city}`);
      return;
    }

    const mapContainer = document.getElementById('property-map');
    if (!mapContainer) return;

    // Using Leaflet for map display
    const mapScript = document.createElement('script');
    mapScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    mapScript.onload = () => {
      const mapLink = document.createElement('link');
      mapLink.rel = 'stylesheet';
      mapLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(mapLink);

      setTimeout(() => {
        const map = window.L.map('property-map').setView([coords.lat, coords.lng], 13);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Add marker for property location
        window.L.marker([coords.lat, coords.lng]).addTo(map)
          .bindPopup(`<strong>${city}</strong><br>Property Location`)
          .openPopup();
      }, 100);
    };
    document.head.appendChild(mapScript);
  } catch (error) {
    console.error('Error initializing map:', error);
  }
}

function generateGoogleMapsLink(location) {
  const city = location.split(',')[0].trim();
  return `https://www.google.com/maps/search/${encodeURIComponent(city)},+Ghana`;
}

async function renderPropertyDetails(property, container) {
  if (!container || !property) return;

  // Fetch weather data
  const weather = await getWeatherData(property.location);

  const weatherHTML = weather ? `
    <div class="weather-card">
      <div class="weather-card__header">
        <h3>Weather in ${property.location.split(',')[0]}</h3>
      </div>
      <div class="weather-card__content">
        <div class="weather-card__main">
          <div class="weather-icon">${getWeatherEmoji(weather.code)}</div>
          <div class="weather-info">
            <div class="temperature">${weather.temperature}°C</div>
            <div class="condition">${weather.condition}</div>
          </div>
        </div>
        <div class="weather-card__details">
          <div class="weather-detail">
            <span>Humidity</span>
            <strong>${weather.humidity}%</strong>
          </div>
          <div class="weather-detail">
            <span>Wind Speed</span>
            <strong>${weather.windSpeed} km/h</strong>
          </div>
        </div>
      </div>
    </div>
  ` : '';

  const googleMapsLink = generateGoogleMapsLink(property.location);
  const isFav = isFavorite(property.id);

  container.innerHTML = `
    <div class="property-details__hero">
      <img src="${property.images}" alt="${property.name}" onerror="this.src='images/house/best-modern-home.jpg'" class="property-details__image" />
      <button class="favorite-btn ${isFav ? 'is-active' : ''}" id="favorite-btn" type="button" aria-label="${isFav ? 'Remove from favorites' : 'Save to favorites'}">
        ${isFav ? '♥' : '♡'}
      </button>
    </div>

    <div class="property-details__main">
      <div class="property-details__header">
        <div>
          <p class="property-details__location">${property.location}</p>
          <h1>${property.name}</h1>
          <p class="property-details__price">${formatPrice(property.price)}</p>
        </div>
      </div>

      <div class="property-details__grid">
        <section class="property-details__section">
          <h2>Property Features</h2>
          <div class="property-features">
            <div class="feature">
              <strong>Bedrooms</strong>
              <span>${property.bedrooms}</span>
            </div>
            <div class="feature">
              <strong>Bathrooms</strong>
              <span>${property.bathrooms}</span>
            </div>
            <div class="feature">
              <strong>Type</strong>
              <span>${getPropertyType(property.name)}</span>
            </div>
            <div class="feature">
              <strong>Price</strong>
              <span>${formatPrice(property.price)}</span>
            </div>
          </div>
        </section>

        <section class="property-details__section">
          <h2>About This Property</h2>
          <p class="property-description">${property.description}</p>
        </section>

        ${weatherHTML}

        <section class="property-details__section location-section">
          <h2>Location & Routes</h2>
          <div id="property-map" class="property-map" style="height: 400px; border-radius: 8px; margin-bottom: 20px;"></div>
          <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            Open in Google Maps
          </a>
          <p class="location-info">Located in <strong>${property.location}</strong></p>
        </section>
      </div>
    </div>
  `;

  // Add favorite button listener
  const favBtn = document.getElementById('favorite-btn');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      const favorites = toggleFavorite(property.id);
      const isNowFavorite = favorites.includes(property.id);
      favBtn.classList.toggle('is-active', isNowFavorite);
      favBtn.textContent = isNowFavorite ? '♥' : '♡';
      favBtn.setAttribute('aria-label', isNowFavorite ? 'Remove from favorites' : 'Save to favorites');
    });
  }

  // Initialize map after DOM is ready
  setTimeout(() => {
    initializeMap(property.location);
  }, 100);
}

async function loadPropertyPage(containerId = 'property-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    // Get property ID from URL
    const params = new URLSearchParams(window.location.search);
    const propertyId = Number(params.get('id'));

    if (!propertyId) {
      container.innerHTML = '<p>No property selected. Please select a property from the listings.</p>';
      return;
    }

    // Fetch properties data
    const response = await fetch('data/properties.json');
    if (!response.ok) throw new Error('Unable to load properties data');

    const properties = await response.json();
    const property = properties.find(p => p.id === propertyId);

    if (!property) {
      container.innerHTML = '<p>Property not found. Please select a valid property.</p>';
      return;
    }

    await renderPropertyDetails(property, container);
  } catch (error) {
    console.error('Error loading property details:', error);
    container.innerHTML = '<p>Unable to load property details. Please try again later.</p>';
  }
}

export { loadPropertyPage };
