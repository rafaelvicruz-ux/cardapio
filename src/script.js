const api = {
  post: async (path, body) => {
    const token = localStorage.getItem('token');
    const res = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      throw await res.json();
    }
    return res.json();
  },
  get: async (path) => {
    const token = localStorage.getItem('token');
    const res = await fetch(path, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) {
      throw await res.json();
    }
    return res.json();
  }
};

function setMessage(msg, isError = false) {
  const div = document.getElementById('message');
  if (!div) return;
  div.textContent = msg;
  div.className = isError ? 'error' : 'success';
}

function renderLogin() {
  document.getElementById('app').innerHTML = `
    <section class="card auth-card">
      <h2>Entrar</h2>
      <div id="message"></div>
      <form id="login-form">
        <label>e-mail<input type="email" name="email" required></label>
        <label>Senha <input type="password" name="password" required></label>
        <button type="submit">Entrar</button>
      </form>
      <p>Não tem conta? <button id="link-register" class="link-btn">Cadastrar</button></p>
    </section>
  `;

  document.getElementById('link-register').addEventListener('click', renderRegister);

  document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = {
      email: form.get('email'),
      password: form.get('password')
    };
    try {
      const { token } = await api.post('/api/auth', payload);
      localStorage.setItem('token', token);
      setMessage('Login efetuado com sucesso.');
      renderDashboard();
    } catch (error) {
      setMessage(error.message || 'Erro no login', true);
    }
  });
}

function renderRegister() {
  document.getElementById('app').innerHTML = `
    <section class="card auth-card">
      <h2>Cadastrar Usuário</h2>
      <div id="message"></div>
      <form id="register-form">
        <label>Nome<input type="text" name="name" required></label>
        <label>e-mail<input type="email" name="email" required></label>
        <label>Senha <input type="password" name="password" required></label>
        <button type="submit">Registrar</button>
      </form>
      <p>Já tem conta? <button id="link-login" class="link-btn">Entrar</button></p>
    </section>
  `;

  document.getElementById('link-login').addEventListener('click', renderLogin);

  document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password')
    };
    try {
      await api.post('/api/register', payload);
      // Faz login automático após cadastro e inicia a nova área (dashboard)
      const loginResult = await api.post('/api/auth', {
        email: payload.email,
        password: payload.password
      });
      localStorage.setItem('token', loginResult.token);
      setMessage('Cadastro realizado e login automático. Bem-vindo!');
      renderDashboard();
    } catch (error) {
      setMessage(error.message || 'Erro no cadastro', true);
    }
  });
}

async function renderDashboard() {
  try {
    const user = await api.get('/api/user');

    const grocery = await api.get('/api/grocery?period=week');
    const mealplan = await api.get('/api/mealplan?period=week');

    document.getElementById('app').innerHTML = `
      <section class="card">
        <h2>Olá, ${user.name}</h2>
        <button id="logout" class="secondary">Sair</button>
      </section>

      <section class="card">
        <h3>Lista de compras</h3>
        <form id="grocery-form">
          <input type="text" id="item" placeholder="Item" required>
          <select id="period-grocery">
            <option value="week">Semana</option>
            <option value="month">Mês</option>
          </select>
          <button type="submit">Adicionar</button>
        </form>
        <div id="grocery-list"></div>
      </section>

      <section class="card">
        <h3>Cardápios</h3>
        <form id="mealplan-form">
          <input type="text" id="recipe" placeholder="Refeição" required>
          <select id="period-meal">
            <option value="week">Semana</option>
            <option value="month">Mês</option>
          </select>
          <button type="submit">Adicionar</button>
        </form>
        <div id="mealplan-list"></div>
      </section>
    `;

    document.getElementById('logout').addEventListener('click', () => {
      localStorage.removeItem('token');
      renderLogin();
    });

    document.getElementById('grocery-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const item = document.getElementById('item').value.trim();
      const period = document.getElementById('period-grocery').value;
      if (!item) return;
      await api.post('/api/grocery', { item, period });
      event.target.reset();
      await updateLists();
    });

    document.getElementById('mealplan-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const recipe = document.getElementById('recipe').value.trim();
      const period = document.getElementById('period-meal').value;
      if (!recipe) return;
      await api.post('/api/mealplan', { recipe, period });
      event.target.reset();
      await updateLists();
    });

    async function updateLists() {
      const groceries = await api.get('/api/grocery?period=week');
      const mealplans = await api.get('/api/mealplan?period=week');
      const groceryList = document.getElementById('grocery-list');
      const mealplanList = document.getElementById('mealplan-list');

      groceryList.innerHTML = groceries.length ? groceries.map(i => `<p>${i.item}</p>`).join('') : '<p>Sem itens</p>';
      mealplanList.innerHTML = mealplans.length ? mealplans.map(i => `<p>${i.recipe}</p>`).join('') : '<p>Sem cardápios</p>';
    }

    await updateLists();
  } catch (error) {
    localStorage.removeItem('token');
    renderLogin();
  }
}

(function main() {
  if (localStorage.getItem('token')) {
    renderDashboard();
  } else {
    renderLogin();
  }
})();
