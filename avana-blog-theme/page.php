<?php
/**
 * The template for displaying pages
 *
 * @package Avana_Blog_Theme
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();
?>

    <div class="page-section">
        <div class="container">
            <?php
            while ( have_posts() ) {
                the_post();
                ?>
                <article id="post-<?php the_ID(); ?>" <?php post_class( 'single-page' ); ?>>
                    <div class="page-header">
                        <h1 class="page-title"><?php the_title(); ?></h1>
                    </div>

                    <?php if ( has_post_thumbnail() ) : ?>
                        <div class="page-thumbnail">
                            <?php the_post_thumbnail( 'avana-blog-large' ); ?>
                        </div>
                    <?php endif; ?>

                    <div class="page-content">
                        <?php
                        the_content();

                        wp_link_pages( array(
                            'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'avana-blog-theme' ),
                            'after' => '</div>',
                        ) );
                        ?>
                    </div>
                </article>
                <?php
            }

            if ( comments_open() || get_comments_number() ) {
                comments_template();
            }
            ?>
        </div>
    </div>

    <style>
        .page-section {
            padding: 80px 0;
            background-color: var(--color-bg);
        }

        .single-page {
            max-width: 820px;
            margin: 0 auto;
        }

        .page-header {
            margin-bottom: 48px;
            text-align: center;
        }

        .page-title {
            font-size: 2.5rem;
            color: var(--color-primary);
            line-height: 1.2;
            margin-bottom: 0;
        }

        .page-thumbnail {
            margin-bottom: 48px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(36, 52, 71, 0.15);
        }

        .page-thumbnail img {
            width: 100%;
            height: auto;
            display: block;
        }

        .page-content {
            font-size: 1.05rem;
            line-height: 1.85;
        }

        .page-content h2 {
            font-size: 1.8rem;
            margin: 40px 0 20px;
            color: var(--color-primary);
        }

        .page-content h3 {
            font-size: 1.4rem;
            margin: 32px 0 16px;
            color: var(--color-primary);
            padding-left: 16px;
            border-left: 3px solid var(--color-accent);
        }

        .page-content p {
            margin-bottom: 1.8rem;
            line-height: 1.85;
        }

        .page-content ul,
        .page-content ol {
            margin-bottom: 1.8rem;
            margin-left: 1.8rem;
        }

        .page-content li {
            margin-bottom: 0.8rem;
            line-height: 1.8;
        }

        .page-content a {
            color: var(--color-accent);
            text-decoration: underline;
            font-weight: 600;
        }

        .page-content a:hover {
            color: var(--color-accent-hover);
        }

        .page-content blockquote {
            border-left: 4px solid var(--color-accent);
            padding: 1.5rem 1.8rem;
            margin: 1.8rem 0;
            background-color: var(--color-soft-cream);
            font-style: italic;
            color: var(--color-text);
        }

        .page-links {
            margin: 32px 0;
            padding: 20px;
            background-color: var(--color-soft-cream);
            border-radius: 8px;
            text-align: center;
        }

        .page-links a,
        .page-links span {
            display: inline-block;
            margin: 0 4px;
            padding: 6px 12px;
            border-radius: 4px;
            background-color: var(--color-white);
            border: 1px solid var(--color-border);
            text-decoration: none;
            color: var(--color-primary);
            font-weight: 600;
            transition: all 0.3s;
        }

        .page-links a:hover {
            background-color: var(--color-accent);
            border-color: var(--color-accent);
            color: var(--color-white);
            text-decoration: none;
        }

        /* Responsive */
        @media (max-width: 968px) {
            .page-section {
                padding: 60px 0;
            }

            .page-title {
                font-size: 2rem;
            }

            .page-content h2 {
                font-size: 1.5rem;
            }

            .page-content h3 {
                font-size: 1.2rem;
            }
        }

        @media (max-width: 640px) {
            .page-section {
                padding: 40px 0;
            }

            .page-header {
                margin-bottom: 32px;
            }

            .page-title {
                font-size: 1.5rem;
            }

            .page-thumbnail {
                margin-bottom: 32px;
            }

            .page-content {
                font-size: 0.95rem;
            }

            .page-content h2 {
                font-size: 1.3rem;
                margin: 28px 0 16px;
            }

            .page-content h3 {
                font-size: 1.05rem;
                margin: 24px 0 12px;
                padding-left: 12px;
            }

            .page-content p {
                margin-bottom: 1.5rem;
            }

            .page-links {
                margin: 24px 0;
                padding: 16px;
            }

            .page-links a,
            .page-links span {
                padding: 4px 8px;
                margin: 0 2px;
                font-size: 0.85rem;
            }
        }
    </style>

<?php
get_footer();
