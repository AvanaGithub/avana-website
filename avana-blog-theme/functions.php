<?php
/**
 * Avana Surgical Blog Theme - Functions
 *
 * @package Avana_Blog_Theme
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Set up theme features and defaults
 */
function avana_blog_theme_setup() {
    // Add theme support
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'custom-logo' );
    add_theme_support( 'html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ) );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'custom-header' );

    // Register navigation menus
    register_nav_menus( array(
        'primary' => esc_html__( 'Primary Menu', 'avana-blog-theme' ),
        'footer' => esc_html__( 'Footer Menu', 'avana-blog-theme' ),
    ) );

    // Set featured image sizes
    set_post_thumbnail_size( 1200, 600, true );
    add_image_size( 'avana-blog-thumb', 400, 300, true );
    add_image_size( 'avana-blog-large', 1200, 600, true );
}
add_action( 'after_setup_theme', 'avana_blog_theme_setup' );

/**
 * Enqueue styles and scripts
 */
function avana_blog_theme_scripts() {
    // Enqueue Google Fonts
    wp_enqueue_style( 'avana-google-fonts', 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap', array(), null );

    // Enqueue main stylesheet
    wp_enqueue_style( 'avana-blog-style', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );

    // Enqueue navigation script for mobile menu (if needed)
    wp_enqueue_script( 'avana-blog-navigation', get_template_directory_uri() . '/js/navigation.js', array(), wp_get_theme()->get( 'Version' ), true );

    // Localize script
    wp_localize_script( 'avana-blog-navigation', 'avanaMenuOptions', array(
        'expandText' => esc_attr__( 'Expand', 'avana-blog-theme' ),
        'collapseText' => esc_attr__( 'Collapse', 'avana-blog-theme' ),
    ) );

    // Comment reply script
    if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }
}
add_action( 'wp_enqueue_scripts', 'avana_blog_theme_scripts' );

/**
 * Register sidebar/widget areas
 */
function avana_blog_theme_widgets_init() {
    register_sidebar( array(
        'name'          => esc_html__( 'Primary Sidebar', 'avana-blog-theme' ),
        'id'            => 'primary-sidebar',
        'description'   => esc_html__( 'Main sidebar for blog posts', 'avana-blog-theme' ),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ) );
}
add_action( 'widgets_init', 'avana_blog_theme_widgets_init' );

/**
 * Custom excerpt length
 */
function avana_blog_theme_excerpt_length( $length ) {
    return 25;
}
add_filter( 'excerpt_length', 'avana_blog_theme_excerpt_length' );

/**
 * Custom excerpt more
 */
function avana_blog_theme_excerpt_more( $more ) {
    return '...';
}
add_filter( 'excerpt_more', 'avana_blog_theme_excerpt_more' );

/**
 * Add custom body classes
 */
function avana_blog_theme_body_classes( $classes ) {
    if ( is_singular() ) {
        $classes[] = 'single-post';
    }
    if ( is_home() || is_archive() ) {
        $classes[] = 'blog-archive';
    }
    if ( is_front_page() ) {
        $classes[] = 'front-page';
    }
    return $classes;
}
add_filter( 'body_class', 'avana_blog_theme_body_classes' );

/**
 * Get theme mod with fallback
 */
function avana_blog_theme_get_option( $option, $default = '' ) {
    return get_theme_mod( $option, $default );
}

/**
 * Sanitize HTML
 */
function avana_blog_theme_sanitize_html( $html ) {
    return wp_kses_post( $html );
}

/**
 * Get post meta with sanitization
 */
function avana_blog_theme_get_post_meta( $post_id, $key, $single = true ) {
    $value = get_post_meta( $post_id, $key, $single );
    return avana_blog_theme_sanitize_html( $value );
}

/**
 * Customize login page
 */
function avana_blog_theme_login_logo() {
    ?>
    <style type="text/css">
        #login h1 a, .login h1 a {
            background-image: url( '<?php echo esc_url( get_template_directory_uri() ); ?>/images/logo.png' );
            background-size: contain;
            width: 100%;
            height: auto;
        }
    </style>
    <?php
}
add_action( 'login_enqueue_scripts', 'avana_blog_theme_login_logo' );

/**
 * Customize login URL
 */
function avana_blog_theme_login_logo_url() {
    return home_url();
}
add_filter( 'login_headerurl', 'avana_blog_theme_login_logo_url' );

/**
 * Customize login title
 */
function avana_blog_theme_login_logo_url_title() {
    return get_bloginfo( 'name' );
}
add_filter( 'login_headertext', 'avana_blog_theme_login_logo_url_title' );

/**
 * Remove WP emoji script
 */
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

/**
 * Remove unnecessary WordPress head elements
 */
function avana_blog_theme_remove_head_stuff() {
    remove_action( 'wp_head', 'wp_shortlink_wp_head' );
    remove_action( 'wp_head', 'wlwmanifest_link' );
}
add_action( 'init', 'avana_blog_theme_remove_head_stuff' );

/**
 * Default menu fallback
 */
function avana_blog_theme_default_menu() {
    echo '<ul class="main-nav__list">';
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'avana-blog-theme' ) . '</a></li>';
    wp_list_pages( array(
        'title_li' => '',
        'echo' => true,
    ) );
    echo '</ul>';
}

/**
 * Footer menu fallback
 */
function avana_blog_theme_footer_menu_fallback() {
    echo '<ul class="site-footer__links">';
    wp_list_pages( array(
        'title_li' => '',
        'echo' => true,
        'depth' => 1,
    ) );
    echo '</ul>';
}
