<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Krzysztof Pabisz - Web Developer</title>
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
  <header class="header">
    <div class="header__container">
      <h1><a href="<?php echo site_url(); ?>">Portfolio</a></h1>
      <div class="header__container-menu-group">
        <nav class="main-navigation">
          <?php
          wp_nav_menu(
            array(
              'theme_location' => 'headerMainMenu',
            )
          );
          ?>
            <div class="header__container-search">
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
        </nav>
      </div>

      <i class="fas fa-bars"></i>
      <i class="fas fa-angle-up off"></i>
    </div>
    

  </header>
  <div class="main">