exports.generateOrderId = (sequence) => {
  const year = new Date().getFullYear();
  return `SC-${year}-${String(sequence).padStart(5, '0')}`;
};