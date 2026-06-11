<?php
function site_files() {
  wp_enqueue_script_module('main_scripts', get_theme_file_uri('/assets/js/main.js'), [], null, []);
  // wp_enqueue_script('main_scripts', get_theme_file_uri('/assets/js/main.js'), [], null, true);
  wp_enqueue_style('Website_main_styles', get_theme_file_uri('/assets/css/style.css'));
  wp_enqueue_style('custom-google-fonts', 'https://fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i', false);
  wp_enqueue_style('font-saira-condensed', 'https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@400;700&display=swap', false);
  wp_enqueue_style('font-saira', 'https://fonts.googleapis.com/css2?family=Saira:wght@300;400&display=swap', false);
  wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
  wp_enqueue_style('font-awesome-icons', 'https://use.fontawesome.com/releases/v5.0.12/css/all.css');
  }

add_action('wp_enqueue_scripts', 'site_files', 999);

function register_swiper() {
    wp_enqueue_style( 'swiper-css', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css' );
    wp_enqueue_script( 'swiper-js', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', array( 'jquery' ), null, true );
}
add_action( 'wp_enqueue_scripts', 'register_swiper' );


// function website_features() {
//   add_theme_support('title-tag');
// }

// add_theme_support( 'post-thumbnails' );
// add_action('after_setup_theme', 'website_features');

// Creating a custom menu
function custom_new_menu()
{
	register_nav_menu('headerMainMenu', ('Header Main Menu'));
	register_nav_menu('footerMainMenu', ('Footer Main Menu'));
}
add_action('init', 'custom_new_menu');

// function wpdocs_theme_slug_widgets_init() {
// 	register_sidebar( array(
// 		'name'          => 'Main Sidebar',
// 		'id'            => 'sidebar-1',
// 	) );
// }
// add_action( 'widgets_init', 'wpdocs_theme_slug_widgets_init' );

add_filter('show_admin_bar', '__return_false');