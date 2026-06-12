async function loadPartial(elementId, filePath) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Failed to load ${filePath}: ${response.status}`);
  }

  element.innerHTML = await response.text();
}

import { loadFeaturedListings, loadListingsPage, loadFavoritesPage } from './PropertyList.js';
import { loadPropertyPage } from './PropertyDetails.js';

async function initLayout() {
  try {
    await Promise.all([
      loadPartial('header', 'partials/header.html'),
      loadPartial('footer', 'partials/footer.html')
    ]);

    const yearSpan = document.querySelector('#footer #year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }

    if (window.location.pathname.includes('property.html')) {
      await loadPropertyPage();
    } else if (window.location.pathname.includes('listings.html')) {
      await loadListingsPage();
    } else if (window.location.pathname.includes('favourites.html')) {
      await loadFavoritesPage();
    } else {
      await loadFeaturedListings();
    }
  } catch (error) {
    console.error('Unable to load shared layout:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLayout);
} else {
  initLayout();
}
