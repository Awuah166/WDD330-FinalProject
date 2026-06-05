const FAVORITES_KEY = 'real-estate-favorites';

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveFavorites(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  const favorites = getFavorites();
  const nextFavorites = favorites.includes(id)
    ? favorites.filter((item) => item !== id)
    : [...favorites, id];

  saveFavorites(nextFavorites);
  return nextFavorites;
}

export { FAVORITES_KEY, getFavorites, saveFavorites, isFavorite, toggleFavorite };
