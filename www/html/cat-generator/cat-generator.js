class CatGenerator {
  constructor() {
    this.img = document.querySelector('.cat-gen__img');
    this.btn = document.querySelector('.cat-gen__btn');

    if (this.img && this.btn) {
      this.imgURL = this.img.getAttribute('data-url');
      this.currentNum = 1;

      this.btn.addEventListener('click', () => {
        this.img.classList.remove('cat-gen__img--show');
        this.img.classList.add('cat-gen__img--fade');

        setTimeout(() => {
          this.randomizeImage();
          this.img.classList.remove('cat-gen__img--fade');
          this.img.classList.add('cat-gen__img--show');
        }, 500);
      });
    }
  }

  randomizeImage() {
    let next;
    do {
      next = Math.ceil(Math.random() * 15);
    } while (next === this.currentNum);
    this.currentNum = next;
    this.img.src = `${this.imgURL}/cat${this.currentNum}.jpg`;
  }
}

new CatGenerator();
