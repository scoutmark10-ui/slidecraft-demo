const axios = require('axios');

exports.sendWebhook = async (order) => {
  const webhookSecret = process.env.CHEGOU_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('⚠️  CHEGOU_WEBHOOK_SECRET não definido. Notificação não enviada.');
    return;
  }

  const title = '🎉 Novo Pedido SlideCraft';
  const message = [
    `Pedido: ${order.orderId}`,
    `Cliente: ${order.nome}`,
    `Universidade: ${order.universidade}`,
    `Tema: ${order.tema}`,
    `Idioma: ${order.idioma}`,
    `Pack: ${order.pack}`,
    `Slides: ${order.slides}`,
    `Valor: ${order.valor} MZN`,
    `Pagamento: Confirmado`
  ].join('\n');

  const payload = {
    title,
    message,
    subtitle: 'Novo pedido recebido',
    sound: 'success',
    channel: 'pedidos',
    // interruption: 'time-sensitive', // opcional, conforme necessidade
    open_url: `http://seusite.com/pedido/${order.orderId}`,
    actions: [
      { label: 'Ver detalhes', url: `http://seusite.com/pedido/${order.orderId}` }
    ]
  };

  try {
    const response = await axios.post(
      `https://api.chegou.dev/v1/${webhookSecret}`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.data.ok) {
      console.log(`✅ Notificação enviada ao chegou.dev (ID: ${response.data.id})`);
      if (response.data.delivered_to) {
        console.log(`   Entregue para ${response.data.delivered_to} dispositivo(s)`);
      }
      if (response.data.scheduled_for) {
        console.log(`   Agendada para ${response.data.scheduled_for}`);
      }
    } else {
      console.error('❌ Resposta inesperada do webhook:', response.data);
    }
  } catch (error) {
    console.error('Erro ao enviar webhook:', error.response?.data || error.message);
    // Não interrompe o fluxo principal, apenas loga
  }
};