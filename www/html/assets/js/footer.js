function setFooterDynamicLinks() {
  const base = window.location.hostname === 'localhost' ? 'http://' : 'https://';
  const host = window.location.hostname === 'localhost' ? 'localhost' : 'krzysztofpabisz.pl';

  document.getElementById('footer-portfolio-link').href = `${base}portfolio.${host}`;
  document.getElementById('footer-shop-link').href = `${base}shop.${host}`;
  document.getElementById('footer-year').textContent = new Date().getFullYear();
}

fetch('/assets/partials/footer.html')
  .then(r => r.text())
  .then(html => {
    document.body.insertAdjacentHTML('beforeend', html);
    setFooterDynamicLinks();
  });
