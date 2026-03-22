async function fetchMenu() {
  try {
    const res = await fetch('/api/cardapio');
    const menu = await res.json();
    const menuEl = document.getElementById('menu');
    menuEl.innerHTML = menu.map(item => `
      <article class="card">
        <h2>${item.nome}</h2>
        <p>${item.preco}</p>
      </article>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar menu', error);
    document.getElementById('menu').innerHTML = '<p>Falha ao carregar o cardápio.</p>';
  }
}

fetchMenu();
