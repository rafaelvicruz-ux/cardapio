document.addEventListener('DOMContentLoaded', function() {
  const redirectToIndexBlog = function() {
    // Redireciona para a página correta após login/cadastro
    window.location.href = 'index.blog.html';
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
