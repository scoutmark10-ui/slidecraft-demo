const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { generateOrderId } = require('../utils/orderId');
const { initiateMpesaPayment } = require('../services/mpesa');
const { sendWebhook } = require('../services/webhook');
const { generateReceipt } = require('../services/receipt');

const ORDERS_FILE = path.join(__dirname, '..', 'database', 'orders.json');

// Garante que o arquivo de pedidos existe
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
}

function readOrders() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } catch (error) {
    console.error('Erro ao ler orders.json:', error);
    return [];
  }
}

function saveOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Erro ao salvar orders.json:', error);
  }
}

function findOrderByOrderId(orderId) {
  const orders = readOrders();
  return orders.find(order => order.orderId === orderId);
}

// Criação do pedido (status inicial: "Recebido")
exports.createOrder = (req, res) => {
  try {
    const {
      nome, whatsapp, email, universidade, docente,
      tema, idioma, slides, pack, prazo, observacoes
    } = req.body;

    if (!nome || !whatsapp || !email || !universidade || !tema || !idioma || !slides || !pack) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    // Cálculo do valor (preço por slide)
    const pricing = {
      basico: { pt: 19.7, en: 21.7 },
      normal: { pt: 23.7, en: 26.7 },
      premium: { pt: 29.7, en: 33.7 }
    };
    const packKey = pack.toLowerCase();
    const langKey = idioma.toLowerCase() === 'português' ? 'pt' : 'en';
    const valor = pricing[packKey][langKey] * parseInt(slides);

    const orders = readOrders();
    const orderId = generateOrderId(orders.length + 1); // ex: SC-202600001

    const newOrder = {
      id: uuidv4(), // interno
      orderId,
      nome,
      whatsapp,
      email,
      universidade,
      docente: docente || '',
      tema,
      idioma,
      slides: parseInt(slides),
      pack: packKey,
      prazo: prazo || 'normal',
      observacoes: observacoes || '',
      valor,
      status: 'Recebido',
      paymentMethod: null,
      paymentType: null, // 'full' ou '50'
      paidAmount: 0,
      totalPaid: 0,
      paymentDetails: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.push(newOrder);
    saveOrders(orders);

    console.log(`✅ Pedido criado: ${orderId}`);
    res.status(201).json({ orderId: newOrder.orderId, valor });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Iniciar pagamento via M-Pesa
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId, phone, amount, paymentType } = req.body;

    if (!orderId || !phone || !amount) {
      return res.status(400).json({ error: 'Dados de pagamento incompletos' });
    }

    const order = findOrderByOrderId(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Atualiza o pedido com informações de pagamento
    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    orders[orderIndex].paymentType = paymentType || 'full';
    orders[orderIndex].paymentMethod = 'M-Pesa';
    orders[orderIndex].whatsapp = phone;
    orders[orderIndex].updatedAt = new Date().toISOString();

    // Para simulação local, vamos aceitar o pagamento
    if (process.env.NODE_ENV !== 'production') {
      orders[orderIndex].status = 'Pagamento confirmado';
      orders[orderIndex].paidAmount = amount;
      orders[orderIndex].totalPaid = amount;
    }

    saveOrders(orders);

    console.log(`💰 Pagamento iniciado para pedido ${orderId}: ${amount} MZN`);
    res.json({ success: true, message: 'Pagamento iniciado com sucesso' });
  } catch (error) {
    console.error('Erro ao iniciar pagamento:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
};

// Callback do M-Pesa (para produção e simulação)
exports.paymentCallback = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'OrderId não fornecido' });
    }

    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const order = orders[orderIndex];

    if (status === 'success') {
      order.status = 'Em produção';
      order.updatedAt = new Date().toISOString();
      order.paymentConfirmed = true;
      order.paymentDate = new Date().toISOString();
      
      saveOrders(orders);

      // Gerar recibo
      try {
        const receiptPath = await generateReceipt(order);
        console.log(`📄 Recibo gerado: ${receiptPath}`);
        order.receiptPath = receiptPath;
        saveOrders(orders);
      } catch (receiptError) {
        console.error('Erro ao gerar recibo:', receiptError);
      }

      // Enviar webhook
      try {
        await sendWebhook(order);
      } catch (webhookError) {
        console.error('Erro ao enviar webhook:', webhookError);
      }

      console.log(`✅ Pagamento confirmado para pedido ${orderId}`);
      res.json({ success: true, message: 'Pagamento confirmado', status: order.status });
    } else {
      order.status = 'Pagamento falhou';
      order.updatedAt = new Date().toISOString();
      saveOrders(orders);
      
      console.log(`❌ Pagamento falhou para pedido ${orderId}`);
      res.json({ success: false, message: 'Pagamento falhou' });
    }
  } catch (error) {
    console.error('Erro no callback de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter status de um pedido
exports.getOrderStatus = (req, res) => {
  try {
    const { orderId } = req.params;
    const order = findOrderByOrderId(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Retorna apenas informações não sensíveis
    const publicOrder = {
      orderId: order.orderId,
      status: order.status,
      valor: order.valor,
      pack: order.pack,
      idioma: order.idioma,
      slides: order.slides,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paymentMethod: order.paymentMethod,
      paidAmount: order.paidAmount,
      totalPaid: order.totalPaid,
      hasReceipt: !!order.receiptPath
    };

    res.json(publicOrder);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};