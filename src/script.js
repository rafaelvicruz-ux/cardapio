const loginArea = document.getElementById("loginArea");
const blogSection = document.getElementById("blog");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

function getUsers() {
  const stored = localStorage.getItem("users");
  return stored ? JSON.parse(stored) : [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function setLoggedInUser(username) {
  localStorage.setItem("loggedInUser", username);
}

function getLoggedInUser() {
  return localStorage.getItem("loggedInUser");
}

function showBlog(greeting) {
  loginArea.style.display = "none";
  blogSection.style.display = "block";
  if (greeting) {
    const title = document.querySelector("#blog h2");
    title.innerText = `Blog - Bem-vindo, ${greeting}`;
  }
  blogSection.scrollIntoView({ behavior: "smooth" });
}

function showLoginArea() {
  loginArea.style.display = "block";
  blogSection.style.display = "none";
}

function tryLogin() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) {
    alert("Preencha usuário e senha.");
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user || user.password !== password) {
    alert("Usuário ou senha inválidos. Por favor, verifique e tente novamente.");
    return;
  }

  setLoggedInUser(user.username);
  showBlog(user.username);
}

function tryRegister() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) {
    alert("Preencha usuário e senha para cadastrar.");
    return;
  }

  const users = getUsers();
  const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    alert("Este usuário já existe. Escolha outro nome.");
    return;
  }

  users.push({ username, password });
  saveUsers(users);
  setLoggedInUser(username);
  alert("Cadastro realizado com sucesso! Você já está logado.");
  showBlog(username);
}

loginButton.onclick = tryLogin;
registerButton.onclick = tryRegister;

const loggedUser = getLoggedInUser();
if (loggedUser) {
  showBlog(loggedUser);
} else {
  showLoginArea();
}
