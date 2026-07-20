require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', orderRoutes);

// Servir os recibos gerados como arquivos estáticos (para download)
app.use('/receipts', express.static('receipts'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SlideCraft Demo backend rodando em http://localhost:${PORT}`);
});