<?php
    get_header();
?>

<?php
switch (true) {
  case is_page('cat-generator'):
    get_template_part('templates/content-cat');
    break;
  case is_page('gallery'):
    get_template_part('templates/content-gallery');
    break;

  default:
    if (have_posts()) {
      while (have_posts()) {
        the_post();
        ?>
        <h3><?php the_title(); ?></h3>
        <div><?php the_content(); ?></div>
        <?php
      }
    }
    break;
}
?>



<?php
get_footer();
?>