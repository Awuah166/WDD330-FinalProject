async function loadPartial(elementId, filePath) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Failed to load ${filePath}: ${response.status}`);
  }

  element.innerHTML = await response.text();
}

/* Hamburger Menu Toggle */
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeBtn = document.getElementById('close-btn');
  const navMenu = document.getElementById('nav-menu');

  if (!hamburgerBtn || !closeBtn || !navMenu) return;

  const openMenu = () => {
    navMenu.classList.add('active');
    hamburgerBtn.classList.add('active');
    closeBtn.classList.add('active');
  };

  const closeMenu = () => {
    navMenu.classList.remove('active');
    hamburgerBtn.classList.remove('active');
    closeBtn.classList.remove('active');
  };

  hamburgerBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  // Close menu when a link is clicked
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

import { loadFeaturedListings, loadListingsPage, loadFavoritesPage } from './PropertyList.js';
import { loadPropertyPage } from './PropertyDetails.js';

async function initLayout() {
  try {
    await Promise.all([
      loadPartial('header', 'partials/header.html'),
      loadPartial('footer', 'partials/footer.html')
    ]);

    initHamburgerMenu();

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
