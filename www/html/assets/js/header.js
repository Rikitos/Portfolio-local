class HeaderMenu {
  constructor() {
    this.container = document.querySelector('.header__container');
    this.hamburgerBtn = document.querySelector('.header__hamburger');
    this.hamburger = document.querySelector('.hamburger');
    this.mobileNav = document.querySelector('.header__mobile-nav');

    document.addEventListener('scroll', () => {
      if (window.scrollY > 0) {
        this.container.classList.add('scrolling');
      } else {
        this.container.classList.remove('scrolling');
      }
    });

    if (this.hamburgerBtn) {
      this.hamburgerBtn.addEventListener('click', () => {
        this.hamburger.classList.toggle('open');
        this.mobileNav.classList.toggle('open');
      });
    }
  }
}

function setDynamicLinks() {
  const base = window.location.hostname === 'localhost' ? 'http://' : 'https://';
  const host = window.location.hostname === 'localhost' ? 'localhost' : 'krzysztofpabisz.pl';

  document.getElementById('portfolio-link').href = `${base}portfolio.${host}`;
  document.getElementById('shop-link').href = `${base}shop.${host}`;
  document.getElementById('portfolio-link-mobile').href = `${base}portfolio.${host}`;
  document.getElementById('shop-link-mobile').href = `${base}shop.${host}`;
}

fetch('/assets/partials/header.html')
  .then(r => r.text())
  .then(html => {
    document.body.insertAdjacentHTML('afterbegin', html);
    new HeaderMenu();
    setDynamicLinks();
  });
