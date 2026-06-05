import { getFavorites, isFavorite, toggleFavorite } from './favorites.js';

function getPropertyType(name) {
  const normalized = name.toLowerCase();
  if (normalized.includes('villa')) return 'Villa';
  if (normalized.includes('apartment') || normalized.includes('condo') || normalized.includes('condominium')) return 'Apartment';
  return 'House';
}

function formatPrice(price) {
  return `$${Number(price).toLocaleString()}`;
}

function renderPropertyCards(container, properties, options = {}) {
  if (!container) return;

  if (!properties.length) {
    container.innerHTML = '<p>No properties match your search.</p>';
    return;
  }

  container.innerHTML = properties.map((property) => `
    <article class="property-card">
      <img src="${property.images}" alt="${property.name}" onerror="this.src='images/house/best-modern-home.jpg'" />
      <div class="property-card__content">
        <div class="property-card__top-row">
          <p class="property-card__location">${property.location}</p>
          <button
            class="favorite-btn ${isFavorite(property.id) ? 'is-active' : ''}"
            type="button"
            data-favorite-id="${property.id}"
            aria-label="${isFavorite(property.id) ? 'Remove from favorites' : 'Save to favorites'}"
          >${isFavorite(property.id) ? '♥' : '♡'}</button>
        </div>
        <h2>${property.name}</h2>
        <p class="property-card__description">${property.description}</p>
        <div class="property-card__meta">
          <span>${property.bedrooms} beds</span>
          <span>${property.bathrooms} baths</span>
          <span>${getPropertyType(property.name)}</span>
        </div>
        <div class="property-card__footer">
          <strong>${formatPrice(property.price)}</strong>
          <a href="property.html?id=${property.id}">View details</a>
        </div>
      </div>
    </article>
  `).join('');

  if (options.onFavoriteToggle) {
    container.querySelectorAll('[data-favorite-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.getAttribute('data-favorite-id'));
        const favorites = toggleFavorite(id);
        button.classList.toggle('is-active', favorites.includes(id));
        button.textContent = favorites.includes(id) ? '♥' : '♡';
        button.setAttribute('aria-label', favorites.includes(id) ? 'Remove from favorites' : 'Save to favorites');
        options.onFavoriteToggle(favorites, id);
      });
    });
  }
}

async function loadFeaturedListings(containerId = 'featured-listings') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch('data/properties.json');
    if (!response.ok) throw new Error('Unable to load properties data');

    const properties = await response.json();
    renderPropertyCards(container, properties.slice(0, 6), { onFavoriteToggle: () => {} });
  } catch (error) {
    console.error('Unable to render featured listings:', error);
    container.innerHTML = '<p>Featured listings are unavailable right now.</p>';
  }
}

async function loadListingsPage(containerId = 'listings-grid', summaryId = 'listings-summary') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch('data/properties.json');
    if (!response.ok) throw new Error('Unable to load properties data');

    const properties = await response.json();
    const params = new URLSearchParams(window.location.search);
    const location = params.get('location') || '';
    const maxPrice = Number(params.get('price')) || Infinity;
    const type = (params.get('type') || '').toLowerCase();

    const filtered = properties.filter((property) => {
      const matchesLocation = !location || property.location.toLowerCase().includes(location.toLowerCase());
      const matchesPrice = property.price <= maxPrice;
      const matchesType = !type || getPropertyType(property.name).toLowerCase() === type;
      return matchesLocation && matchesPrice && matchesType;
    });

    const summary = document.getElementById(summaryId);
    if (summary) {
      summary.textContent = filtered.length
        ? `Showing ${filtered.length} result${filtered.length === 1 ? '' : 's'}${location ? ` in ${location}` : ''}.`
        : 'No listings match your filters yet.';
    }

    const renderListings = () => {
      renderPropertyCards(container, filtered, {
        onFavoriteToggle: () => renderListings()
      });
    };

    renderListings();
  } catch (error) {
    console.error('Unable to render listings:', error);
    container.innerHTML = '<p>Listings are unavailable right now.</p>';
  }
}

async function loadFavoritesPage(containerId = 'favorites-grid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch('data/properties.json');
    if (!response.ok) throw new Error('Unable to load properties data');

    const properties = await response.json();
    const favorites = getFavorites();
    const saved = properties.filter((property) => favorites.includes(property.id));

    if (!saved.length) {
      container.innerHTML = '<p>You have not saved any favorite properties yet.</p>';
      return;
    }

    const renderFavorites = () => {
      renderPropertyCards(container, saved, {
        onFavoriteToggle: () => {
          const updatedFavorites = getFavorites();
          const refreshed = properties.filter((property) => updatedFavorites.includes(property.id));
          if (!refreshed.length) {
            container.innerHTML = '<p>You have not saved any favorite properties yet.</p>';
            return;
          }
          renderPropertyCards(container, refreshed, {
            onFavoriteToggle: () => renderFavorites()
          });
        }
      });
    };

    renderFavorites();
  } catch (error) {
    console.error('Unable to render favorites:', error);
    container.innerHTML = '<p>Favorites are unavailable right now.</p>';
  }
}

export { loadFeaturedListings, loadListingsPage, loadFavoritesPage };
