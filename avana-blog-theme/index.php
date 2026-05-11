<?php
/**
 * The main template file
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css)
 *
 * @package Avana_Blog_Theme
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();
?>

    <div class="site-main-content">
        <div class="container">
            <?php
            if ( have_posts() ) {
                // Blog archive
                if ( is_home() || is_archive() ) {
                    // This should be handled by home.php, but here's a fallback
                    echo '<div class="archive-fallback">';
                    echo '<h1>' . esc_html__( 'Blog Archives', 'avana-blog-theme' ) . '</h1>';
                    while ( have_posts() ) {
                        the_post();
                        echo '<article>';
                        echo '<h2><a href="' . esc_url( get_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></h2>';
                        the_excerpt();
                        echo '<a href="' . esc_url( get_permalink() ) . '">' . esc_html__( 'Read More →', 'avana-blog-theme' ) . '</a>';
                        echo '</article>';
                    }
                    echo '</div>';
                } else {
                    // Single post fallback
                    while ( have_posts() ) {
                        the_post();
                        echo '<article>';
                        echo '<h1>' . esc_html( get_the_title() ) . '</h1>';
                        the_content();
                        echo '</article>';
                    }
                }
            } else {
                // No posts found
                echo '<div class="no-posts">';
                echo '<h1>' . esc_html__( 'Nothing found', 'avana-blog-theme' ) . '</h1>';
                echo '<p>' . esc_html__( 'Sorry, no posts or pages found.', 'avana-blog-theme' ) . '</p>';
                echo '</div>';
            }
            ?>
        </div>
    </div>

    <style>
        .site-main-content {
            padding: 80px 0;
            background-color: var(--color-bg);
        }

        .archive-fallback article {
            margin-bottom: 48px;
            padding-bottom: 48px;
            border-bottom: 1px solid var(--color-border);
        }

        .archive-fallback article:last-child {
            border-bottom: none;
        }

        .no-posts {
            text-align: center;
            padding: 60px 20px;
            background-color: var(--color-white);
            border-radius: 12px;
        }

        .no-posts h1 {
            margin-bottom: 20px;
            color: var(--color-primary);
        }

        .no-posts p {
            color: var(--color-muted);
            font-size: 1.1rem;
        }
    </style>

<?php
get_footer();
