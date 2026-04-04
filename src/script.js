// ---------- DADOS GLOBAIS ----------
let currentUser = null;
let currentChannel = null;

// ---------- FUNÇÕES DE PERSISTÊNCIA (por usuário) ----------
function getUsers() {
  const stored = localStorage.getItem('blogUsers_v2');
  return stored ? JSON.parse(stored) : [];
}

function saveUsers(users) {
  localStorage.setItem('blogUsers_v2', JSON.stringify(users));
}

function getCurrentUserData() {
  if (!currentUser) return null;
  const users = getUsers();
  return users.find(u => u.username === currentUser);
}

function updateCurrentUserData(updatedUser) {
  const users = getUsers();
  const index = users.findIndex(u => u.username === updatedUser.username);
  if (index !== -1) {
    users[index] = updatedUser;
    saveUsers(users);
  }
}

// ---------- ANIMAÇÕES E FEEDBACK VISUAL ----------
function showTemporaryMessage(elementId, message, isError = true) {
  const msgDiv = document.getElementById(elementId);
  if (!msgDiv) return;
  msgDiv.innerText = message;
  msgDiv.style.display = 'block';
  msgDiv.style.animation = 'none';
  msgDiv.offsetHeight; // força reflow
  msgDiv.style.animation = 'gentleShake 0.3s ease';
  if (!isError) {
    msgDiv.style.background = '#d1fae5';
    msgDiv.style.color = '#065f46';
  } else {
    msgDiv.style.background = '#ffe4e8';
    msgDiv.style.color = '#e11d48';
  }
  setTimeout(() => {
    msgDiv.style.display = 'none';
  }, 3000);
}

// Animar transição entre login e cadastro
function animateAuthSwitch(showLogin) {
  const loginCard = document.getElementById('loginCard');
  const registerCard = document.getElementById('registerCard');
  if (!loginCard || !registerCard) return;

  if (showLogin) {
    registerCard.style.animation = 'fadeSlideDown 0.25s forwards';
    setTimeout(() => {
      registerCard.style.display = 'none';
      loginCard.style.display = 'block';
      loginCard.style.animation = 'fadeSlideUp 0.4s cubic-bezier(0.2,0.9,0.4,1.1)';
    }, 200);
  } else {
    loginCard.style.animation = 'fadeSlideDown 0.25s forwards';
    setTimeout(() => {
      loginCard.style.display = 'none';
      registerCard.style.display = 'block';
      registerCard.style.animation = 'fadeSlideUp 0.4s cubic-bezier(0.2,0.9,0.4,1.1)';
    }, 200);
  }
}

// ---------- FUNÇÕES DE AUTENTICAÇÃO (com feedback visual) ----------
function showRegister() {
  animateAuthSwitch(false);
  document.getElementById('regUsername').value = '';
  document.getElementById('regPassword').value = '';
  const regError = document.getElementById('regError');
  if (regError) regError.style.display = 'none';
}

function showLogin() {
  animateAuthSwitch(true);
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
  const loginError = document.getElementById('loginError');
  if (loginError) loginError.style.display = 'none';
}

function register() {
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!username || !password) {
    showTemporaryMessage('regError', 'Preencha usuário e senha', true);
    return;
  }

  const users = getUsers();
  if (users.some(u => u.username === username)) {
    showTemporaryMessage('regError', 'Usuário já existe', true);
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ username, password: hashedPassword, canais: [] });
  saveUsers(users);

  currentUser = username;
  document.getElementById('currentUserName').innerText = currentUser;
  localStorage.setItem('blogSessionUser', currentUser);

  const authOverlay = document.querySelector('.auth-overlay');
  if (authOverlay) authOverlay.style.display = 'none';
  document.getElementById('blogScreen').style.display = 'block';
  renderizarCanais();
}

// ==================== LOGIN MELHORADO ====================
function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');

  if (!username || !password) {
    showTemporaryMessage('loginError', 'Preencha usuário e senha', true);
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    showTemporaryMessage('loginError', 'Usuário não encontrado', true);
    return;
  }

  if (bcrypt.compareSync(password, user.password)) {
    currentUser = username;
    document.getElementById('currentUserName').innerText = currentUser;

    // ===== ANIMAÇÃO SUAVE DE TRANSIÇÃO =====
    const authOverlay = document.querySelector('.auth-overlay');
    
    if (authOverlay) {
      authOverlay.style.transition = 'opacity 0.4s ease';
      authOverlay.style.opacity = '0';

      setTimeout(() => {
        authOverlay.style.display = 'none';
        authOverlay.style.opacity = '1'; // reseta para próxima vez

        // Abre o BlogScreen com animação
        const blogScreen = document.getElementById('blogScreen');
        blogScreen.style.display = 'block';
        blogScreen.style.opacity = '0';
        blogScreen.style.transform = 'translateY(30px)';

        // Força reflow
        blogScreen.offsetHeight;

        blogScreen.style.transition = 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        blogScreen.style.opacity = '1';
        blogScreen.style.transform = 'translateY(0)';

        renderizarCanais();

      }, 400);
    } else {
      // Fallback
      const loginCard = document.getElementById('loginCard');
      const registerCard = document.getElementById('registerCard');
      if (loginCard) loginCard.style.display = 'none';
      if (registerCard) registerCard.style.display = 'none';
      document.getElementById('blogScreen').style.display = 'block';
      renderizarCanais();
    }

    localStorage.setItem('blogSessionUser', currentUser);

  } else {
    showTemporaryMessage('loginError', 'Senha incorreta', true);
  }
}

function logout() {
  currentUser = null;
  currentChannel = null;
  
  const blogScreen = document.getElementById('blogScreen');
  const channelScreen = document.getElementById('channelScreen');
  
  if (blogScreen) blogScreen.style.display = 'none';
  if (channelScreen) channelScreen.style.display = 'none';

  const authOverlay = document.querySelector('.auth-overlay');
  if (authOverlay) {
    authOverlay.style.display = 'flex';
    authOverlay.style.animation = 'fadeSlideUp 0.4s';
  }

  showLogin();
  
  // Limpa campos
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
  
  localStorage.removeItem('blogSessionUser');
}

// ---------- GERENCIAMENTO DE CANAIS (com melhorias visuais) ----------
function renderizarCanais() {
  const user = getCurrentUserData();
  if (!user) return;
  const grid = document.getElementById('channelsGrid');
  if (!grid) return;
  const canais = user.canais || [];
  if (canais.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:white; background:rgba(0,0,0,0.5); padding:40px; border-radius:20px;">🎬 Nenhum canal ainda. Clique em "Criar novo canal" para começar!</div>';
    return;
  }
  grid.innerHTML = '';
  canais.forEach(canal => {
    const card = document.createElement('div');
    card.className = 'channel-card';
    card.style.cursor = 'pointer';
    card.onclick = () => abrirCanal(canal.id);
    
    const capaImg = document.createElement('img');
    capaImg.className = 'channel-capa';
    capaImg.src = canal.capa || 'https://via.placeholder.com/400x160?text=Sem+Capa';
    capaImg.onerror = () => { capaImg.src = 'https://via.placeholder.com/400x160?text=Sem+Capa'; };
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'channel-info';
    infoDiv.innerHTML = `
      <h3>${escapeHtml(canal.nome)}</h3>
      <p>${escapeHtml(canal.descricao || 'Sem descrição')}</p>
      <div class="content-count">📹 ${canal.posts ? canal.posts.length : 0} post(s)</div>
    `;
    card.appendChild(capaImg);
    card.appendChild(infoDiv);
    grid.appendChild(card);
  });
}

function abrirCanal(canalId) {
  const user = getCurrentUserData();
  if (!user) return;
  const canal = user.canais.find(c => c.id === canalId);
  if (!canal) return;
  currentChannel = canal;
  
  const blogScreen = document.getElementById('blogScreen');
  const channelScreen = document.getElementById('channelScreen');
  blogScreen.style.display = 'none';
  channelScreen.style.display = 'block';
  channelScreen.style.animation = 'fadeSlideUp 0.3s ease';
  
  channelScreen.innerHTML = `
    <button class="back-btn" onclick="voltarParaCanais()">← Voltar para meus canais</button>
    <div class="channel-header">
      <img class="channel-capa-grande" src="${canal.capa || 'https://via.placeholder.com/120'}" onerror="this.src='https://via.placeholder.com/120'">
      <div>
        <h2>${escapeHtml(canal.nome)}</h2>
        <p>${escapeHtml(canal.descricao || '')}</p>
      </div>
    </div>
    <div class="add-post-form">
      <h3>➕ Criar novo post</h3>
      <div class="file-input-group">
        <label>Tipo de mídia:</label>
        <select id="postTipo">
          <option value="imagem">Imagem</option>
          <option value="video">Vídeo</option>
        </select>
      </div>
      <div class="file-input-group">
        <label>Arquivo (imagem ou vídeo):</label>
        <input type="file" id="postArquivo" accept="image/*">
        <div id="previewPostMedia" class="media-preview-post"></div>
      </div>
      <div class="file-input-group">
        <label>Título do post:</label>
        <input type="text" id="postTitulo" placeholder="Ex: Minha aventura">
      </div>
      <div class="file-input-group">
        <label>Descrição:</label>
        <textarea id="postDescricao" rows="2" placeholder="Conte mais..."></textarea>
      </div>
      <button class="publish-btn" onclick="adicionarPost()">Publicar post</button>
    </div>
    <h3>📌 Posts do canal</h3>
    <div id="postsContainer" class="posts-grid"></div>
  `;
  
   renderizarPosts();
  
  // Preview com feedback melhorado
  const fileInput = document.getElementById('postArquivo');
  const tipoSelect = document.getElementById('postTipo');
  
  const updatePreview = () => {
    const previewDiv = document.getElementById('previewPostMedia');
    previewDiv.innerHTML = '';
    const file = fileInput.files[0];
    if (file) {
      const tipo = tipoSelect.value;
      const url = URL.createObjectURL(file);
      if (tipo === 'imagem') {
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '180px';
        img.style.borderRadius = '12px';
        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        previewDiv.appendChild(img);
      } else {
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '180px';
        video.style.borderRadius = '12px';
        previewDiv.appendChild(video);
      }
    }
  };
  
  if (fileInput) fileInput.addEventListener('change', updatePreview);
  if (tipoSelect) {
    tipoSelect.addEventListener('change', () => {
      const accept = tipoSelect.value === 'imagem' ? 'image/*' : 'video/*';
      fileInput.accept = accept;
      fileInput.value = '';
      document.getElementById('previewPostMedia').innerHTML = '';
    });
  }
}

function renderizarPosts() {
  if (!currentChannel) return;
  const container = document.getElementById('postsContainer');
  if (!container) return;
  const posts = currentChannel.posts || [];
  if (posts.length === 0) {
    container.innerHTML = '<div class="empty-message">📭 Nenhum post ainda. Crie o primeiro acima!</div>';
    return;
  }
  container.innerHTML = '';
  posts.forEach((post, idx) => {
    const card = document.createElement('div');
    card.className = 'post-card';
    let mediaHtml = '';
    if (post.tipo === 'imagem') {
      mediaHtml = `<img class="post-media" src="${post.midiaData}" alt="post" onerror="this.src='https://via.placeholder.com/300?text=Erro+na+imagem'">`;
    } else if (post.tipo === 'video') {
      mediaHtml = `<video class="post-media" controls src="${post.midiaData}" onerror="this.style.display='none'; this.parentElement.innerHTML+='<div style=\'padding:20px\'>❌ Vídeo indisponível</div>'"></video>`;
    }
    card.innerHTML = `
      ${mediaHtml}
      <div class="post-info">
        <h4>${escapeHtml(post.titulo)}</h4>
        <p>${escapeHtml(post.descricao || '')}</p>
        <div class="post-date">📅 ${new Date(post.data).toLocaleString()}</div>
        <button class="delete-post" data-idx="${idx}">🗑️ Excluir post</button>
      </div>
    `;
    const delBtn = card.querySelector('.delete-post');
    delBtn.addEventListener('click', () => excluirPost(idx));
    container.appendChild(card);
  });
}

function adicionarPost() {
  const tipo = document.getElementById('postTipo').value;
  const arquivoInput = document.getElementById('postArquivo');
  const titulo = document.getElementById('postTitulo').value.trim();
  const descricao = document.getElementById('postDescricao').value.trim();
  
  if (!arquivoInput.files || arquivoInput.files.length === 0) {
    alert('Selecione um arquivo de imagem ou vídeo.');
    return;
  }
  if (!titulo) {
    alert('Dê um título para o post.');
    return;
  }
  
  const file = arquivoInput.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const midiaBase64 = e.target.result;
    const user = getCurrentUserData();
    if (!user || !currentChannel) return;
    const canal = user.canais.find(c => c.id === currentChannel.id);
    if (canal) {
      if (!canal.posts) canal.posts = [];
      const novoPost = {
        id: Date.now().toString(),
        tipo: tipo,
        titulo: titulo,
        descricao: descricao,
        midiaData: midiaBase64,
        data: new Date().toISOString()
      };
      canal.posts.push(novoPost);
      updateCurrentUserData(user);
      currentChannel = canal;
      renderizarPosts();
      renderizarCanais();
      
      // animação de sucesso e limpeza
      const btn = document.querySelector('.publish-btn');
      const originalText = btn.innerText;
      btn.innerText = '✓ Publicado!';
      setTimeout(() => { btn.innerText = originalText; }, 1200);
      
      document.getElementById('postTitulo').value = '';
      document.getElementById('postDescricao').value = '';
      document.getElementById('postArquivo').value = '';
      document.getElementById('previewPostMedia').innerHTML = '';
    }
  };
  reader.readAsDataURL(file);
}

function excluirPost(index) {
  if (!confirm('Tem certeza que deseja excluir este post?')) return;
  const user = getCurrentUserData();
  if (!user || !currentChannel) return;
  const canal = user.canais.find(c => c.id === currentChannel.id);
  if (canal && canal.posts) {
    canal.posts.splice(index, 1);
    updateCurrentUserData(user);
    currentChannel = canal;
    renderizarPosts();
    renderizarCanais();
  }
}

function voltarParaCanais() {
  currentChannel = null;
  document.getElementById('blogScreen').style.display = 'block';
  document.getElementById('channelScreen').style.display = 'none';
  renderizarCanais();
}

// ---------- MODAL CRIAR CANAL (com preview e transição) ----------
function abrirModalCriarCanal() {
  const modal = document.getElementById('modalCanal');
  modal.style.display = 'flex';
  modal.style.animation = 'fadeSlideUp 0.2s ease';
  document.getElementById('canalNome').value = '';
  document.getElementById('canalDesc').value = '';
  document.getElementById('capaInput').value = '';
  const preview = document.getElementById('capaPreview');
  preview.style.display = 'none';
  preview.src = '';
}

function fecharModalCanal() {
  const modal = document.getElementById('modalCanal');
  modal.style.animation = 'fadeSlideDown 0.2s forwards';
  setTimeout(() => {
    modal.style.display = 'none';
    modal.style.animation = '';
  }, 200);
}

function salvarCanal() {
  const nome = document.getElementById('canalNome').value.trim();
  const desc = document.getElementById('canalDesc').value.trim();
  const icon = '📺';
  const cor = '#667eea';
  const capaFile = document.getElementById('capaInput').files[0];
  
  if (!nome) {
    alert('O nome do canal é obrigatório.');
    return;
  }
  
  const processarCapa = (capaBase64) => {
    const user = getCurrentUserData();
    if (!user) return;
    if (!user.canais) user.canais = [];
    const novoCanal = {
      id: Date.now().toString(),
      nome: nome,
      descricao: desc,
      icon: icon,
      cor: cor,
      capa: capaBase64 || null,
      posts: []
    };
    user.canais.push(novoCanal);
    updateCurrentUserData(user);
    fecharModalCanal();
    renderizarCanais();
    
    // feedback visual
    const btn = document.querySelector('#saveCanalBtn');
    const original = btn.innerText;
    btn.innerText = '✓ Salvo!';
    setTimeout(() => { btn.innerText = original; }, 1000);
  };
  
  if (capaFile) {
    const reader = new FileReader();
    reader.onload = (e) => processarCapa(e.target.result);
    reader.readAsDataURL(capaFile);
  } else {
    processarCapa(null);
  }
}

// Preview da capa no modal
function setupCapaPreview() {
  const capaInput = document.getElementById('capaInput');
  const previewImg = document.getElementById('capaPreview');
  if (capaInput && previewImg) {
    capaInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          previewImg.src = ev.target.result;
          previewImg.style.display = 'block';
          previewImg.style.animation = 'fadeSlideUp 0.2s';
        };
        reader.readAsDataURL(e.target.files[0]);
      } else {
        previewImg.style.display = 'none';
      }
    });
  }
}

// ---------- UTIL ----------
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
  const modal = document.getElementById('modalCanal');
  if (event.target === modal) fecharModalCanal();
};

// ---------- INICIALIZAÇÃO (com usuário demo e animações) ----------
(function init() {
  // Injetar estilos de animação caso não existam no CSS
  if (!document.querySelector('#dynamicAnimations')) {
    const style = document.createElement('style');
    style.id = 'dynamicAnimations';
    style.textContent = `
      @keyframes fadeSlideUp {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeSlideDown {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(30px); }
      }
      @keyframes gentleShake {
        0%,100%{ transform:translateX(0); }
        25%{ transform:translateX(-6px); }
        75%{ transform:translateX(6px); }
      }
      .auth-overlay {
        transition: all 0.2s;
      }
      .channel-card {
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .channel-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.3);
      }
      .btn-criar-canal, .publish-btn, .back-btn, .logout-btn {
        transition: transform 0.1s ease, background 0.2s;
      }
      .btn-criar-canal:active, .publish-btn:active {
        transform: scale(0.97);
      }
      #loginError, #regError {
        display: none;
        margin: 10px 0;
        padding: 8px;
        border-radius: 40px;
        font-size: 0.8rem;
        text-align: center;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Botões de login, cadastro e modal
  document.getElementById('btnLoginAction')?.addEventListener('click', login);
  document.getElementById('showRegisterBtn')?.addEventListener('click', showRegister);
  document.getElementById('btnRegisterAction')?.addEventListener('click', register);
  document.getElementById('backToLoginBtn')?.addEventListener('click', showLogin);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('openModalCanalBtn')?.addEventListener('click', abrirModalCriarCanal);
  document.getElementById('closeModalBtn')?.addEventListener('click', fecharModalCanal);
  document.getElementById('saveCanalBtn')?.addEventListener('click', salvarCanal);

  setupCapaPreview();
  
  // Usuário demo
  const users = getUsers();
  if (users.length === 0) {
    const demoPassword = bcrypt.hashSync('123456', 10);
    users.push({
      username: 'demo',
      password: demoPassword,
      canais: []
    });
    saveUsers(users);
    console.log('🔐 Usuário demo criado: demo / 123456');
  }
  
  // Verificar se há sessão ativa
  const savedUser = localStorage.getItem('blogSessionUser');
  if (savedUser && getUsers().find(u => u.username === savedUser)) {
    currentUser = savedUser;
    document.getElementById('currentUserName').innerText = currentUser;
    document.querySelector('.auth-overlay').style.display = 'none';
    document.getElementById('blogScreen').style.display = 'block';
    renderizarCanais();
  } else {
    document.querySelector('.auth-overlay').style.display = 'flex';
    showLogin();
  }
})();

// Salvar sessão ao logar
const originalLogin = login;
window.login = function() {
  originalLogin();
  if (currentUser) localStorage.setItem('blogSessionUser', currentUser);
};

const originalLogout = logout;
window.logout = function() {
  originalLogout();
  localStorage.removeItem('blogSessionUser');
};

// Exportar funções para o escopo global (já estão, mas reforçar)
window.showRegister = showRegister;
window.showLogin = showLogin;
window.register = register;
window.login = login;
window.logout = logout;
window.abrirModalCriarCanal = abrirModalCriarCanal;
window.fecharModalCanal = fecharModalCanal;
window.salvarCanal = salvarCanal;
window.adicionarPost = adicionarPost;
window.voltarParaCanais = voltarParaCanais;