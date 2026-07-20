const axios = require('axios');

// Inicia uma transação M-Pesa (aqui você integrará com a API real)
exports.initiateMpesaPayment = async (order, phoneNumber, amount) => {
  const payload = {
    carteira: process.env.MPESA_WALLET,
    numero: phoneNumber, // ex: '84XXXXXXX'
    valor: amount
  };

  try {
    const response = await axios.post(process.env.MPESA_API_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao comunicar com M-Pesa:', error.response?.data || error.message);
    throw new Error('Falha no pagamento. Tente novamente.');
  }
};

// Simulação de callback (para testes locais) – você pode expor um endpoint que chama essa função
exports.simulateMpesaCallback = async (orderId, status = 'success') => {
  // Aqui você atualizaria o pedido com base no callback real
  return { orderId, status };
};