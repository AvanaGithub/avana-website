<?php
/**
 * The main template for displaying the blog archive page
 *
 * @package Avana_Blog_Theme
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();
?>

    <div class="blog-archive-section">
        <div class="container">
            <div class="blog-archive__header">
                <h1 class="blog-archive__title"><?php esc_html_e( 'Latest Articles', 'avana-blog-theme' ); ?></h1>
                <p class="blog-archive__subtitle"><?php esc_html_e( 'Expert insights on pain relief, recovery, and orthopaedic care', 'avana-blog-theme' ); ?></p>
            </div>

            <?php if ( have_posts() ) : ?>
                <div class="blog-grid">
                    <?php
                    while ( have_posts() ) :
                        the_post();
                        ?>
                        <article class="blog-card">
                            <?php if ( has_post_thumbnail() ) : ?>
                                <a href="<?php the_permalink(); ?>" class="blog-card__image-link">
                                    <div class="blog-card__image">
                                        <?php the_post_thumbnail( 'avana-blog-large', array( 'alt' => get_the_title() ) ); ?>
                                    </div>
                                </a>
                            <?php endif; ?>

                            <div class="blog-card__content">
                                <time class="blog-card__date" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
                                    <?php echo esc_html( get_the_date( 'F j, Y' ) ); ?>
                                </time>

                                <h2 class="blog-card__title">
                                    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                                </h2>

                                <div class="blog-card__excerpt">
                                    <?php the_excerpt(); ?>
                                </div>

                                <a href="<?php the_permalink(); ?>" class="blog-card__read-more">
                                    <?php esc_html_e( 'Read More →', 'avana-blog-theme' ); ?>
                                </a>
                            </div>
                        </article>
                        <?php
                    endwhile;
                    ?>
                </div>

                <!-- Pagination -->
                <div class="blog-pagination">
                    <?php
                    echo wp_kses_post( paginate_links( array(
                        'prev_text' => '← ' . esc_html__( 'Previous', 'avana-blog-theme' ),
                        'next_text' => esc_html__( 'Next', 'avana-blog-theme' ) . ' →',
                    ) ) );
                    ?>
                </div>
            <?php else : ?>
                <div class="blog-no-posts">
                    <p><?php esc_html_e( 'No articles found. Please check back later.', 'avana-blog-theme' ); ?></p>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <style>
        .blog-archive-section {
            padding: 80px 0;
            background-color: var(--color-bg);
        }

        .blog-archive__header {
            text-align: center;
            margin-bottom: 56px;
            max-width: 760px;
            margin-left: auto;
            margin-right: auto;
        }

        .blog-archive__title {
            font-size: 2.25rem;
            margin-bottom: 12px;
            color: var(--color-primary);
        }

        .blog-archive__subtitle {
            color: var(--color-muted);
            font-size: 1.125rem;
            line-height: 1.7;
        }

        .blog-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
            margin-bottom: 56px;
        }

        .blog-card {
            background-color: var(--color-white);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(36, 52, 71, 0.08);
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
        }

        .blog-card:hover {
            box-shadow: 0 12px 30px rgba(36, 52, 71, 0.12);
            transform: translateY(-4px);
        }

        .blog-card__image-link {
            text-decoration: none;
            overflow: hidden;
            display: block;
        }

        .blog-card__image {
            width: 100%;
            height: 220px;
            background: linear-gradient(135deg, #EDEDED 0%, #E0DFDC 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-muted);
            overflow: hidden;
            font-style: italic;
        }

        .blog-card__image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.3s;
        }

        .blog-card:hover .blog-card__image img {
            transform: scale(1.05);
        }

        .blog-card__content {
            padding: 28px;
            display: flex;
            flex-direction: column;
            flex: 1;
        }

        .blog-card__date {
            color: var(--color-accent);
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .blog-card__title {
            font-size: 1.25rem;
            margin: 12px 0;
            color: var(--color-primary);
            line-height: 1.4;
        }

        .blog-card__title a {
            color: var(--color-primary);
            text-decoration: none;
            transition: color 0.3s;
        }

        .blog-card__title a:hover {
            color: var(--color-accent);
            text-decoration: none;
        }

        .blog-card__excerpt {
            color: var(--color-muted);
            font-size: 0.95rem;
            margin-bottom: 16px;
            flex: 1;
            line-height: 1.7;
        }

        .blog-card__excerpt p {
            margin-bottom: 0;
        }

        .blog-card__read-more {
            color: var(--color-accent);
            font-weight: 600;
            font-size: 0.95rem;
            text-decoration: none;
            transition: all 0.3s;
        }

        .blog-card__read-more:hover {
            color: var(--color-accent-hover);
            text-decoration: none;
        }

        .blog-pagination {
            display: flex;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
            margin-top: 48px;
        }

        .blog-pagination a,
        .blog-pagination span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            min-height: 44px;
            padding: 8px 12px;
            border: 1px solid var(--color-border);
            border-radius: 8px;
            color: var(--color-primary);
            text-decoration: none;
            transition: all 0.3s;
            font-weight: 600;
            font-size: 0.95rem;
        }

        .blog-pagination a:hover {
            background-color: var(--color-accent);
            color: var(--color-white);
            border-color: var(--color-accent);
            text-decoration: none;
        }

        .blog-pagination .current {
            background-color: var(--color-accent);
            color: var(--color-white);
            border-color: var(--color-accent);
        }

        .blog-no-posts {
            text-align: center;
            padding: 60px 20px;
            color: var(--color-muted);
            font-size: 1.1rem;
        }

        /* Responsive */
        @media (max-width: 968px) {
            .blog-archive-section {
                padding: 60px 0;
            }

            .blog-archive__title {
                font-size: 1.85rem;
            }

            .blog-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 24px;
            }
        }

        @media (max-width: 640px) {
            .blog-archive-section {
                padding: 40px 0;
            }

            .blog-archive__header {
                margin-bottom: 32px;
            }

            .blog-archive__title {
                font-size: 1.5rem;
                margin-bottom: 8px;
            }

            .blog-archive__subtitle {
                font-size: 0.95rem;
            }

            .blog-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }

            .blog-card {
                border-radius: 12px;
            }

            .blog-card__image {
                height: 160px;
            }

            .blog-card__content {
                padding: 16px;
            }

            .blog-card__date {
                font-size: 0.75rem;
            }

            .blog-card__title {
                font-size: 1rem;
                margin: 8px 0;
            }

            .blog-card__excerpt {
                font-size: 0.85rem;
                margin-bottom: 12px;
            }

            .blog-card__read-more {
                font-size: 0.85rem;
            }

            .blog-pagination {
                gap: 8px;
            }

            .blog-pagination a,
            .blog-pagination span {
                min-width: 40px;
                min-height: 40px;
                padding: 6px 10px;
                font-size: 0.85rem;
            }
        }
    </style>

<?php
get_footer();
