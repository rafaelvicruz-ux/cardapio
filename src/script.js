document.addEventListener('DOMContentLoaded', function() {
  const redirectToIndexBlog = function() {
    window.location.href = 'index.blog';
  };

  const loginButton = document.getElementById('loginButton');
  const registerButton = document.getElementById('registerButton');

  if (loginButton) {
    loginButton.addEventListener('click', redirectToIndexBlog);
  }

  if (registerButton) {
    registerButton.addEventListener('click', redirectToIndexBlog);
  }
});
