import { Scroller } from "./scroller.js";
// import "./cat-generator.js";

class CatGenerator {
  constructor() {
    this.img = document.querySelector('.Image-Generator__img');
    this.btn = document.querySelector('.Image-Generator__button-btn');
    if (this.img && this.btn) {
      this.imgURL = this.img.getAttribute('data-url');
      this.btn.addEventListener('click', () => {
        console.log('click');
        this.img.classList.remove("show-img");
        this.img.classList.add("fade-img");
        setTimeout(function() {
          this.randomizeImage();
          this.img.classList.remove("fade-img");
          this.img.classList.add("show-img");
        }.bind(this), 500)
      })
    }
  }

  randomizeImage() {
    if (this.imgURL) {
      this.randomNum = Math.ceil(Math.random() * 15);
      this.img.src = `${this.imgURL}/cat${this.randomNum}.jpg`;
    }
  }
}

class HeaderMenu {
  constructor() {
    this.menuContainer = document.querySelector('.header__container');
    this.menuGroup = document.querySelector('.header__container-menu-group');
    this.menuLogo = document.querySelector('.header__container-logo');
    this.fasIcons = document.querySelectorAll('.fas');
    this.isIndex = false;
    this.hamburgers = document.querySelectorAll('.hamburger');
    this.hamburgersContainer = document.querySelector('.header__hamburger');

    document.addEventListener('scroll', () => {
      if(window.scrollY > 0) {
        this.menuContainer.classList.add('scrolling');
      } else this.menuContainer.classList.remove('scrolling')
    })

    if (this.fasIcons.length > 0) {
      this.fasIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
          this.fasIcons.forEach( e => {
            e.classList.toggle('off');
          })
          this.showMenu();
        })
      })
    } else if (this.hamburgers) {
      this.hamburgers.forEach(hamburger => {
        this.hamburgersContainer.addEventListener('click', (e) => {
          hamburger.classList.toggle('open');
          // this.hamburgers.forEach( e => {
          //   e.classList.toggle('open');
          // })
          this.showMenu();
        })
      })
    }
  }

  showMenu() {
    if (this.isIndex) {
        this.menuContainer.style = "";
        this.isIndex = !this.isIndex
    } else {
      this.menuContainer.style.zIndex = "2";
      this.isIndex = !this.isIndex
    }
    this.menuGroup.classList.toggle('menu-opened');
    this.menuLogo.classList.toggle('menu-logo');
  }
}


document.addEventListener('DOMContentLoaded', () => {
  new CatGenerator();
  new HeaderMenu();

  if(document.querySelector('.gallery-wrapper')) {
    const scroller = new Scroller('#root');

    document.addEventListener('wheel', (event) => scroller.listenScroll(event));
    document.addEventListener('swipeUp', () => scroller.scroll(1));
    document.addEventListener('swipeDown', () => scroller.scroll(-1));
    document.addEventListener('keydown', (event) => {
      switch (event.keyCode) {
        case 40:
          return scroller.scroll(1)
        case 38:
          return scroller.scroll(-1)

        default:
          return;
      }
    })
    if(window.scrollY > 1) {

    }
  }


});

