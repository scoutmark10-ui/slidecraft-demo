const params = new URLSearchParams(window.location.search);
const orderId = params.get('orderId');
const valor = Number(params.get('valor'));

const container = document.getElementById('paymentContainer');
container.innerHTML = `
  <h2 class="text-2xl font-bold mb-2">Finalizar Pagamento</h2>
  <p class="text-white/60 mb-6">Pedido <span class="text-gold font-mono">${orderId}</span></p>
  
  <div class="glass p-4 rounded-xl mb-6">
    <div class="flex justify-between items-center">
      <span>Valor total</span>
      <span class="text-2xl font-bold text-gold">${valor.toLocaleString()} MZN</span>
    </div>
  </div>

  <div class="space-y-4 mb-6">
    <label class="flex items-center gap-3 glass-input cursor-pointer">
      <input type="radio" name="paymentType" value="full" checked class="accent-gold">
      Pagar 100% agora
    </label>
    <label class="flex items-center gap-3 glass-input cursor-pointer">
      <input type="radio" name="paymentType" value="50" class="accent-gold">
      Pagar 50% (entrada) — <span class="text-gold">${Math.round(valor*0.5).toLocaleString()} MZN</span>
    </label>
  </div>

  <input type="text" id="phoneNumber" placeholder="Nº M-Pesa (ex: 84XXXXXXXXX)" class="glass-input mb-4">
  <button id="payButton" class="btn-primary w-full">Pagar com M-Pesa</button>
  <p class="text-xs text-white/40 mt-4 text-center">Pagamento processado via M-Pesa. Seguro e instantâneo.</p>
`;

document.getElementById('payButton').addEventListener('click', async () => {
  const phone = document.getElementById('phoneNumber').value;
  if (!phone) return alert('Insira o número de telefone');
  const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
  let amount = valor;
  if (paymentType === '50') amount = Math.round(amount * 0.5);

  try {
    const res = await fetch('http://localhost:3000/api/payment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ orderId, phone, amount, paymentType })
    });
    const data = await res.json();
    if (data.success) {
      setTimeout(() => {
        fetch('http://localhost:3000/api/payment/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: 'success' })
        }).then(() => {
          window.location.href = `success.html?orderId=${orderId}`;
        });
      }, 3000);
      alert('Pedido de pagamento enviado. Verifique seu telefone.');
    } else {
      alert('Falha ao iniciar pagamento');
    }
  } catch (err) { alert('Erro de conexão'); }
});