document.addEventListener('DOMContentLoaded', () => {
  if (isAdmin()) {
    showDashboard();
  } else {
    document.getElementById('adminLogin').classList.remove('hidden');
  }

  document.getElementById('adminLoginBtn').addEventListener('click', async () => {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    try {
      await adminLogin(email, password);
      showDashboard();
    } catch (err) {
      alert('Credenciais inválidas');
    }
  });
});

function showDashboard() {
  document.getElementById('adminLogin').classList.add('hidden');
  document.getElementById('adminDashboard').classList.remove('hidden');
  loadOrders();
}

async function loadOrders() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const orders = await res.json();
    renderOrders(orders);
  } catch (err) {
    document.getElementById('ordersTable').innerHTML = '<p class="text-red-400">Erro ao carregar pedidos.</p>';
  }
}

function renderOrders(orders) {
  let html = '';
  orders.forEach(order => {
    html += `
      <div class="glass p-4 mb-3">
        <div class="flex justify-between">
          <strong>${order.orderId}</strong>
          <span>${order.status}</span>
        </div>
        <div class="text-sm text-white/60">${order.nome} · ${order.universidade} · ${order.valor} MZN</div>
      </div>`;
  });
  document.getElementById('ordersTable').innerHTML = html || '<p>Nenhum pedido.</p>';
}