document.getElementById('requestForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    whatsapp: document.getElementById('whatsapp').value,
    universidade: document.getElementById('universidade').value,
    docente: document.getElementById('docente').value,
    tema: document.getElementById('tema').value,
    idioma: document.getElementById('idioma').value,
    slides: document.getElementById('slides').value,
    pack: document.getElementById('pack').value,
    prazo: document.getElementById('prazo').value,
    observacoes: document.getElementById('observacoes').value,
  };

  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!response.ok) throw new Error('Erro ao criar pedido');
    const data = await response.json();

    // Salva no localStorage
    localStorage.setItem('ultimoPedido', JSON.stringify({ orderId: data.orderId, valor: data.valor }));
    window.location.href = `payment.html?orderId=${data.orderId}&valor=${data.valor}`;
  } catch (error) {
    alert('Erro ao criar pedido. Verifique sua conexão.');
  }
});