const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateReceipt = async (order) => {
  const receiptsDir = path.join(__dirname, '..', 'receipts');
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const filePath = path.join(receiptsDir, `recibo_${order.orderId}.pdf`);
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Cabeçalho
  doc.fontSize(20).text('SlideCraft Demo', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('Recibo de Pagamento', { align: 'center' });
  doc.moveDown();

  // Linha horizontal
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  // Dados
  const leftX = 50;
  const rightX = 300;
  const lineGap = 18;

  doc.fontSize(11);
  doc.text(`ID do Pedido: ${order.orderId}`, leftX, doc.y);
  doc.text(`Data: ${new Date(order.createdAt).toLocaleDateString('pt-MZ')}`, rightX, doc.y);
  doc.moveDown();
  doc.text(`Cliente: ${order.nome}`);
  doc.text(`Universidade: ${order.universidade}`);
  doc.moveDown();
  doc.text(`Idioma: ${order.idioma}`);
  doc.text(`Pack: ${order.pack}`);
  doc.text(`Número de Slides: ${order.slides}`);
  doc.moveDown();
  doc.text(`Valor Total: ${order.valor} MZN`, { continued: true }).text(`   Método: M-Pesa`);
  doc.moveDown();
  doc.text(`Estado: Pago`);

  // Rodapé
  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();
  doc.fontSize(10).text('Obrigado por escolher a SlideCraft!', { align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};