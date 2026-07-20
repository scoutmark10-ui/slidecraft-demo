const params = new URLSearchParams(window.location.search);
const orderId = params.get('orderId');
document.getElementById('orderIdDisplay').textContent = orderId;
document.getElementById('receiptLink').href = `http://localhost:3000/receipts/recibo_${orderId}.pdf`;