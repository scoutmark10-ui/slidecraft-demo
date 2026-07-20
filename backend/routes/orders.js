const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');


// Criar novo pedido (antes do pagamento)
router.post('/orders', authenticateToken, orderController.createOrder);

// Iniciar pagamento via M-Pesa
router.post('/payment/initiate', orderController.initiatePayment);

// Simular callback do M-Pesa (para testes locais)
router.post('/payment/initiate', authenticateToken, orderController.initiatePayment);

// Obter status de um pedido
router.get('/orders/:orderId', authenticateToken, orderController.getOrderStatus);

module.exports = router;