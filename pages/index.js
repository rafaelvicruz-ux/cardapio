import { useEffect, useState } from 'react';

const api = {
  post: async (path, body) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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

export default function Home() {
  const [page, setPage] = useState('loading');
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [user, setUser] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [mealplanList, setMealplanList] = useState([]);

  const setMsg = (msg, isError = false) => {
    setMessage(msg);
    setMessageError(isError);
  };

  const loadDashboard = async () => {
    try {
      const userData = await api.get('/api/user');
      setUser(userData);
      setPage('dashboard');

      const [grocery, mealplan] = await Promise.all([
        api.get('/api/grocery?period=week'),
        api.get('/api/mealplan?period=week')
      ]);
      setGroceryList(grocery);
      setMealplanList(mealplan);
    } catch (_err) {
      localStorage.removeItem('token');
      setPage('login');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (token) {
      loadDashboard();
    } else {
      setPage('login');
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    try {
      const body = { email: form.get('email'), password: form.get('password') };
      const { token } = await api.post('/api/auth', body);
      localStorage.setItem('token', token);
      setMsg('Login efetuado com sucesso.');
      await loadDashboard();
    } catch (error) {
      setMsg(error.message || 'Erro no login', true);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    try {
      await api.post('/api/register', {
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password')
      });
      setMsg('Cadastro realizado. Faça login.');
      setPage('login');
    } catch (error) {
      setMsg(error.message || 'Erro no cadastro', true);
    }
  };

  const refreshLists = async () => {
    try {
      const [grocery, mealplan] = await Promise.all([
        api.get('/api/grocery?period=week'),
        api.get('/api/mealplan?period=week')
      ]);
      setGroceryList(grocery);
      setMealplanList(mealplan);
    } catch (_err) {
      setPage('login');
      localStorage.removeItem('token');
    }
  };

  const addGrocery = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const item = form.get('item');
    const period = form.get('period');
    if (!item) return;
    await api.post('/api/grocery', { item, period });
    event.target.reset();
    await refreshLists();
  };

  const addMealplan = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const recipe = form.get('recipe');
    const period = form.get('period');
    if (!recipe) return;
    await api.post('/api/mealplan', { recipe, period });
    event.target.reset();
    await refreshLists();
  };

  if (page === 'loading') {
    return <main><h1>Carregando...</h1></main>;
  }

  if (page === 'register') {
    return (
      <main>
        <h1>Cadastre-se</h1>
        <div id="message" className={messageError ? 'error' : 'success'}>{message}</div>
        <form onSubmit={handleRegister} className="auth-card">
          <input name="name" placeholder="Nome" required />
          <input name="email" type="email" placeholder="E-mail" required />
          <input name="password" type="password" placeholder="Senha" required />
          <button type="submit">Cadastrar</button>
        </form>
        <button onClick={() => setPage('login')} className="link-btn secondary">Já tenho conta</button>
      </main>
    );
  }

  if (page === 'login') {
    return (
      <main>
        <h1>Cadastre e entre no maior sistema de receitas</h1>
        <div id="message" className={messageError ? 'error' : 'success'}>{message}</div>
        <form onSubmit={handleLogin} className="auth-card">
          <input name="email" type="email" placeholder="E-mail" required />
          <input name="password" type="password" placeholder="Senha" required />
          <button type="submit">Entrar</button>
        </form>
        <button onClick={() => { setPage('register'); setMessage(''); }} className="link-btn secondary">Cadastrar</button>
      </main>
    );
  }

  return (
    <main>
      <h1>Olá, {user?.name || 'Usuário'}</h1>
      <button onClick={() => { localStorage.removeItem('token'); setPage('login'); setUser(null); }} className="secondary">Sair</button>

      <section className="card">
        <h2>Lista de compras</h2>
        <form onSubmit={addGrocery} id="grocery-form">
          <input name="item" placeholder="Item" required />
          <select name="period" defaultValue="week">
            <option value="week">Semana</option>
            <option value="month">Mês</option>
          </select>
          <button type="submit">Adicionar</button>
        </form>
        <div id="grocery-list">
          {groceryList.length > 0 ? groceryList.map((i, idx) => <p key={idx}>{i.item}</p>) : <p>Sem itens</p>}
        </div>
      </section>

      <section className="card">
        <h2>Cardápios</h2>
        <form onSubmit={addMealplan} id="mealplan-form">
          <input name="recipe" placeholder="Refeição" required />
          <select name="period" defaultValue="week">
            <option value="week">Semana</option>
            <option value="month">Mês</option>
          </select>
          <button type="submit">Adicionar</button>
        </form>
        <div id="mealplan-list">
          {mealplanList.length > 0 ? mealplanList.map((i, idx) => <p key={idx}>{i.recipe}</p>) : <p>Sem cardápios</p>}
        </div>
      </section>
    </main>
  );
}
