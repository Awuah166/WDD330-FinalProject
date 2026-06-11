// Prevent form refresh on search
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('.search-card');
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Stop page refresh
      
      // Get search values
      const location = searchForm.querySelector('[name="location"]').value;
      const price = searchForm.querySelector('[name="price"]').value;
      const type = searchForm.querySelector('[name="type"]').value;
      
      // Build URL without refresh
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (price) params.append('price', price);
      if (type) params.append('type', type);
      
      // Navigate without page refresh
      window.location.href = `listings.html?${params.toString()}`;
    });
  }
});
