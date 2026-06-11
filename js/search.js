// Prevent form refresh on search
console.log('Search script loaded');

function initSearchForm() {
  const searchForm = document.querySelector('.search-card');
  console.log('Search form found:', searchForm);
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      console.log('Form submitted');
      e.preventDefault(); // Stop page refresh
      e.stopPropagation(); // Stop event bubbling
      
      // Get search values
      const location = searchForm.querySelector('[name="location"]').value;
      const price = searchForm.querySelector('[name="price"]').value;
      const type = searchForm.querySelector('[name="type"]').value;
      
      console.log('Search values:', { location, price, type });
      
      // Build URL without refresh
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (price) params.append('price', price);
      if (type) params.append('type', type);
      
      const url = `listings.html?${params.toString()}`;
      console.log('Navigating to:', url);
      
      // Navigate without page refresh
      window.location.href = url;
    });
    
    console.log('Form submit event listener attached');
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearchForm);
} else {
  initSearchForm();
}
