function calcularPreco(pack, idioma, slides) {
  const precos = {
    basico: { pt: 19.7, en: 21.7 }, // preços por slide
    normal: { pt: 23.7, en: 26.7 }, 
    premium: { pt: 29.7, en: 33.7 }
  };
  const lang = idioma.toLowerCase() === 'português' ? 'pt' : 'en';
  return precos[pack][lang] * slides;
}

function atualizarPreco() {
  const pack = document.getElementById('pack').value;
  const idioma = document.getElementById('idioma').value;
  const slides = parseInt(document.getElementById('slides').value) || 0;
  const preco = calcularPreco(pack, idioma, slides);
  document.getElementById('priceDisplay').textContent = `${preco.toLocaleString()} MZN`;
}

document.addEventListener('input', atualizarPreco);