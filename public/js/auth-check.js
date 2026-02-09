// Auth check - Add to all protected pages
(function() {
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    window.location.href = '/login';
    return;
  }

  // Verify user exists
  fetch(`/api/auth/check/${userId}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        localStorage.clear();
        window.location.href = '/login';
      }
    })
    .catch(() => {
      localStorage.clear();
      window.location.href = '/login';
    });
})();
