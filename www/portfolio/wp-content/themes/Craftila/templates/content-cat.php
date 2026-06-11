<?php 
?>
<section class="Image-Generator">
  <h1 class="Image-Generator__title">Cat Generator</h1>
  <div class="Image-Generator__description">Generate random cat meme now</div>
  <div class="Image-Generator__button">
    <button class="Image-Generator__button-btn">Click</button>
  </div>
  <div>
    <img class ="Image-Generator__img show-img" src="<?php echo get_theme_file_uri('/assets/images/cats/cat1.jpg'); ?>" alt="" data-url="<?php echo get_theme_file_uri() . '/assets/images/cats';?>">
  </div>
</section>

<script>

document.addEventListener('DOMContentLoaded', () => {
    console.log('dsadsaasd')
    const swiper = new Swiper('.swiper', {

    // Optional parameters
    direction: 'horizontal',
    slidesPerView: 5,
    spaceBetween: 25,
    //   loop: false,
    loop: true,
    speed: 4000,
    autoplay: {
        delay: 0,
        disableOnInteraction: false,
    },
    //   loopedSlides: 1,

    // If we need pagination
    // pagination: {
    //   el: '.swiper-pagination',

    // },
    });

});
</script>

<!-- Slider main container -->
<div class="swiper">
  <!-- Additional required wrapper -->
  <div class="swiper-wrapper">
    <!-- Slides -->
    <?php $slides = get_field('swiper'); ?>
    <!-- <div class="swiper-slide"> -->

      
      <?php 
        if ( have_rows('swiper')): 
          while( have_rows('swiper') ) : the_row(); ?>
            <div class="swiper-slide">
              <?php 
              // echo print_r(get_sub_field('slider_img')); 
              ?>
              <img src="<?php echo get_sub_field('swiper_img')['sizes']['medium']; ?>" alt="">
          </div> 
          <?php
        endwhile;
      endif;

      ?>


    <!-- </div> -->
    
  </div>
  <!-- If we need pagination -->
  <div class="swiper-pagination"></div>

</div>