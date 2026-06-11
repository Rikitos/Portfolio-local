document.addEventListener('DOMContentLoaded', function() {
  const base = window.location.hostname === 'localhost' 
    ? 'http://' 
    : 'https://';
  const host = window.location.hostname === 'localhost'
    ? 'localhost'
    : 'krzysztofpabisz.pl';

  document.getElementById('portfolio-link').href = `${base}portfolio.${host}`;
  document.getElementById('shop-link').href = `${base}shop.${host}`;

  console.log(document.getElementById('portfolio-link').href);
});

