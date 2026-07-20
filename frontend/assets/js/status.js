document.addEventListener('DOMContentLoaded', () => {
  const stored = JSON.parse(localStorage.getItem('ultimoPedido'));
  if (stored) {
    document.getElementById('orderIdInput').value = stored.orderId;
    buscarPedido(stored.orderId);
  }

  document.getElementById('searchOrder').addEventListener('click', () => {
    const orderId = document.getElementById('orderIdInput').value.trim();
    if (orderId) buscarPedido(orderId);
  });
});

async function buscarPedido(orderId) {
  try {
    const res = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderOrder(data);
  } catch (err) {
    document.getElementById('ordersList').innerHTML = '<p class="text-red-400">Pedido não encontrado.</p>';
  }
}

function renderOrder(order) {
  const statusColors = {
    'Em produção': '🟡',
    'Concluído': '🟢',
    'Entregue': '✅',
    'Pagamento confirmado': '🔵',
    'Recebido': '⚪'
  };
  document.getElementById('ordersList').innerHTML = `
    <div class="glass p-6">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-xl font-bold">${order.orderId}</h3>
          <p class="text-white/60 text-sm">${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <span class="text-2xl">${statusColors[order.status] || '⚪'}</span>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm mb-4">
        <div><span class="text-white/50">Status:</span> ${order.status}</div>
        <div><span class="text-white/50">Pack:</span> ${order.pack}</div>
        <div><span class="text-white/50">Slides:</span> ${order.slides}</div>
        <div><span class="text-white/50">Idioma:</span> ${order.idioma}</div>
        <div class="col-span-2"><span class="text-white/50">Valor:</span> <strong class="text-gold">${order.valor} MZN</strong></div>
      </div>
      ${order.hasReceipt ? `<a href="http://localhost:3000/receipts/recibo_${order.orderId}.pdf" class="btn-outline text-sm inline-block" target="_blank">📄 Recibo</a>` : ''}
    </div>`;
}