document.addEventListener('DOMContentLoaded', function() {
  const redirectToIndexBlog = function() {
    // Redireciona para a página correta após login/cadastro
    window.location.href = 'index.blog.html';
  };

  const loginButton = document.getElementById('loginButton');
  const registerButton = document.getElementById('registerButton');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  const trySubmit = function() {
    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!username || !password) {
      alert('Digite usuário e senha antes de continuar.');
      if (usernameInput) usernameInput.focus();
      return;
    }

    // Aqui você pode adicionar autenticação real por API se precisar.
    alert('Login/conexão concluída com sucesso! Redirecionando...');
    redirectToIndexBlog();
  };

  if (loginButton) {
    loginButton.addEventListener('click', trySubmit);
  }

  if (registerButton) {
    registerButton.addEventListener('click', trySubmit);
  }

  if (loginButton) {
    loginButton.addEventListener('click', redirectToIndexBlog);
  }

  if (registerButton) {
    registerButton.addEventListener('click', redirectToIndexBlog);
  }
});
