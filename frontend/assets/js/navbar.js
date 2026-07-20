// assets/js/navbar.js
function updateNavbar() {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;

  if (isLoggedIn()) {
    const user = JSON.parse(localStorage.getItem('slidecraft_user') || '{}');
    const adminLink = isAdmin() ? '<a href="admin.html" class="text-amber-400 hover:text-amber-300 transition text-sm">Admin</a>' : '';
    navLinks.innerHTML = `
      <a href="request.html" class="text-white/80 hover:text-white transition text-sm">Solicitar</a>
      <a href="status.html" class="text-white/80 hover:text-white transition text-sm">Meus Pedidos</a>
      <span class="text-white/40 text-sm hidden sm:inline">${user.nome || ''}</span>
      ${adminLink}
      <button onclick="logout()" class="text-red-400 hover:text-red-300 transition text-sm">Sair</button>
    `;
  } else {
    navLinks.innerHTML = `
      <a href="login.html" class="text-white/80 hover:text-white transition text-sm">Entrar</a>
      <a href="register.html" class="bg-amber-400 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-500 transition">Criar conta</a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  let response;
  try {
    // Tenta caminho absoluto primeiro (se servidor HTTP)
    response = await fetch('components/navbar.html');
  } catch (e) {
    // Se falhar, tenta caminho relativo (páginas na raiz)
    response = await fetch('components/navbar.html');
  }
  const html = await response.text();
  container.innerHTML = html;
  updateNavbar();
});