<?php
/**
 * The template for displaying single blog posts
 *
 * @package Avana_Blog_Theme
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();
?>

    <div class="single-post-section">
        <div class="container">
            <article id="post-<?php the_ID(); ?>" <?php post_class( 'single-post' ); ?>>
                <!-- Post Header -->
                <div class="post-header">
                    <h1 class="post-title"><?php the_title(); ?></h1>

                    <div class="post-meta">
                        <time class="post-date" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
                            <?php echo esc_html( get_the_date( 'F j, Y' ) ); ?>
                        </time>
                        <span class="post-author">
                            <?php esc_html_e( 'By', 'avana-blog-theme' ); ?>
                            <a href="<?php echo esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ); ?>">
                                <?php the_author(); ?>
                            </a>
                        </span>
                        <span class="post-reading-time">
                            <?php
                            $content = get_the_content();
                            $word_count = str_word_count( $content );
                            $reading_time = ceil( $word_count / 200 );
                            echo esc_html( sprintf( _n( '%d min read', '%d min read', $reading_time, 'avana-blog-theme' ), $reading_time ) );
                            ?>
                        </span>
                    </div>
                </div>

                <!-- Featured Image -->
                <?php if ( has_post_thumbnail() ) : ?>
                    <div class="post-thumbnail-wrapper">
                        <?php the_post_thumbnail( 'avana-blog-large', array( 'alt' => get_the_title() ) ); ?>
                    </div>
                <?php endif; ?>

                <!-- Post Content -->
                <div class="post-content">
                    <?php
                    the_content();

                    wp_link_pages( array(
                        'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'avana-blog-theme' ),
                        'after' => '</div>',
                    ) );
                    ?>
                </div>

                <!-- Post Footer -->
                <div class="post-footer">
                    <?php
                    $categories = get_the_category();
                    if ( ! empty( $categories ) ) {
                        echo '<div class="post-categories">';
                        foreach ( $categories as $category ) {
                            echo '<a href="' . esc_url( get_category_link( $category->term_id ) ) . '" class="post-category">' . esc_html( $category->name ) . '</a>';
                        }
                        echo '</div>';
                    }

                    $tags = get_the_tags();
                    if ( ! empty( $tags ) ) {
                        echo '<div class="post-tags">';
                        esc_html_e( 'Tags:', 'avana-blog-theme' );
                        foreach ( $tags as $tag ) {
                            echo '<a href="' . esc_url( get_tag_link( $tag->term_id ) ) . '" class="post-tag">' . esc_html( $tag->name ) . '</a>';
                        }
                        echo '</div>';
                    }
                    ?>
                </div>

                <!-- Author Box -->
                <div class="author-box">
                    <?php
                    $author_id = get_the_author_meta( 'ID' );
                    $author_description = get_the_author_meta( 'description', $author_id );
                    ?>
                    <div class="author-box__avatar">
                        <?php echo get_avatar( $author_id, 80 ); ?>
                    </div>
                    <div class="author-box__content">
                        <h3 class="author-box__name">
                            <a href="<?php echo esc_url( get_author_posts_url( $author_id ) ); ?>">
                                <?php the_author(); ?>
                            </a>
                        </h3>
                        <?php if ( ! empty( $author_description ) ) : ?>
                            <p class="author-box__bio"><?php echo esc_html( $author_description ); ?></p>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Navigation -->
                <nav class="post-navigation">
                    <div class="nav-previous">
                        <?php
                        $prev_post = get_previous_post();
                        if ( $prev_post ) {
                            echo '<a href="' . esc_url( get_permalink( $prev_post ) ) . '">';
                            echo '← ' . esc_html__( 'Previous Post', 'avana-blog-theme' );
                            echo '</a>';
                        }
                        ?>
                    </div>
                    <div class="nav-next">
                        <?php
                        $next_post = get_next_post();
                        if ( $next_post ) {
                            echo '<a href="' . esc_url( get_permalink( $next_post ) ) . '">';
                            echo esc_html__( 'Next Post', 'avana-blog-theme' ) . ' →';
                            echo '</a>';
                        }
                        ?>
                    </div>
                </nav>
            </article>

            <!-- Comments -->
            <?php
            if ( comments_open() || get_comments_number() ) {
                comments_template();
            }
            ?>
        </div>
    </div>

    <style>
        .single-post-section {
            padding: 80px 0;
            background-color: var(--color-bg);
        }

        .single-post {
            max-width: 820px;
            margin: 0 auto;
        }

        .post-header {
            margin-bottom: 48px;
            text-align: center;
        }

        .post-title {
            font-size: 2.5rem;
            margin-bottom: 20px;
            color: var(--color-primary);
            line-height: 1.2;
        }

        .post-meta {
            display: flex;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
            color: var(--color-muted);
            font-size: 0.95rem;
            align-items: center;
        }

        .post-date {
            font-weight: 600;
            color: var(--color-accent);
        }

        .post-author a {
            color: var(--color-accent);
            text-decoration: none;
            font-weight: 600;
        }

        .post-author a:hover {
            text-decoration: underline;
        }

        .post-reading-time {
            background-color: var(--color-soft-cream);
            padding: 4px 12px;
            border-radius: 20px;
        }

        .post-thumbnail-wrapper {
            margin-bottom: 48px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(36, 52, 71, 0.15);
        }

        .post-thumbnail-wrapper img {
            width: 100%;
            height: auto;
            display: block;
        }

        .post-content {
            margin-bottom: 48px;
            font-size: 1.05rem;
            line-height: 1.85;
        }

        .post-content h2 {
            font-size: 1.8rem;
            margin: 40px 0 20px;
            color: var(--color-primary);
        }

        .post-content h3 {
            font-size: 1.4rem;
            margin: 32px 0 16px;
            color: var(--color-primary);
            padding-left: 16px;
            border-left: 3px solid var(--color-accent);
        }

        .post-content p {
            margin-bottom: 1.8rem;
            line-height: 1.85;
        }

        .post-content ul,
        .post-content ol {
            margin-bottom: 1.8rem;
            margin-left: 1.8rem;
        }

        .post-content li {
            margin-bottom: 0.8rem;
            line-height: 1.8;
        }

        .post-content a {
            color: var(--color-accent);
            text-decoration: underline;
            font-weight: 600;
        }

        .post-content a:hover {
            color: var(--color-accent-hover);
        }

        .post-content blockquote {
            border-left: 4px solid var(--color-accent);
            padding: 1.5rem 1.8rem;
            margin: 1.8rem 0;
            background-color: var(--color-soft-cream);
            font-style: italic;
            color: var(--color-text);
        }

        .post-content code {
            background-color: var(--color-light-bg);
            padding: 0.2rem 0.6rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }

        .post-content pre {
            background-color: var(--color-light-bg);
            padding: 1.5rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1.8rem 0;
        }

        .post-content pre code {
            background-color: transparent;
            padding: 0;
        }

        .post-footer {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 32px 0;
            border-top: 1px solid var(--color-border);
            border-bottom: 1px solid var(--color-border);
            margin-bottom: 48px;
        }

        .post-categories,
        .post-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        }

        .post-category,
        .post-tag {
            display: inline-block;
            background-color: var(--color-soft-cream);
            color: var(--color-accent);
            padding: 6px 14px;
            border-radius: 20px;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.3s;
        }

        .post-category:hover,
        .post-tag:hover {
            background-color: var(--color-accent);
            color: var(--color-white);
            text-decoration: none;
        }

        .author-box {
            display: flex;
            gap: 20px;
            background-color: var(--color-white);
            padding: 32px;
            border-radius: 12px;
            border: 1px solid var(--color-border);
            margin-bottom: 48px;
        }

        .author-box__avatar {
            flex-shrink: 0;
        }

        .author-box__avatar img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: block;
        }

        .author-box__content {
            flex: 1;
        }

        .author-box__name {
            font-size: 1.2rem;
            margin-bottom: 8px;
            color: var(--color-primary);
        }

        .author-box__name a {
            color: var(--color-primary);
            text-decoration: none;
        }

        .author-box__name a:hover {
            color: var(--color-accent);
        }

        .author-box__bio {
            color: var(--color-muted);
            font-size: 0.95rem;
            line-height: 1.7;
            margin-bottom: 0;
        }

        .post-navigation {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 48px;
        }

        .nav-previous,
        .nav-next {
            /* Navigation items */
        }

        .nav-previous a,
        .nav-next a {
            display: block;
            padding: 16px;
            background-color: var(--color-white);
            border: 1px solid var(--color-border);
            border-radius: 12px;
            color: var(--color-primary);
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
        }

        .nav-previous a:hover,
        .nav-next a:hover {
            border-color: var(--color-accent);
            color: var(--color-accent);
            text-decoration: none;
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
            .single-post-section {
                padding: 60px 0;
            }

            .post-title {
                font-size: 2rem;
            }

            .post-content h2 {
                font-size: 1.5rem;
            }

            .post-content h3 {
                font-size: 1.2rem;
            }

            .author-box {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            .post-navigation {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 640px) {
            .single-post-section {
                padding: 40px 0;
            }

            .post-header {
                margin-bottom: 32px;
            }

            .post-title {
                font-size: 1.5rem;
                margin-bottom: 16px;
            }

            .post-meta {
                font-size: 0.85rem;
                gap: 8px;
            }

            .post-reading-time {
                width: 100%;
            }

            .post-thumbnail-wrapper {
                margin-bottom: 32px;
            }

            .post-content {
                margin-bottom: 32px;
                font-size: 0.95rem;
            }

            .post-content h2 {
                font-size: 1.3rem;
                margin: 28px 0 16px;
            }

            .post-content h3 {
                font-size: 1.05rem;
                margin: 24px 0 12px;
                padding-left: 12px;
            }

            .post-content p {
                margin-bottom: 1.5rem;
            }

            .post-content ul,
            .post-content ol {
                margin-bottom: 1.5rem;
                margin-left: 1.5rem;
            }

            .post-footer {
                padding: 20px 0;
                margin-bottom: 32px;
            }

            .post-category,
            .post-tag {
                font-size: 0.75rem;
                padding: 5px 10px;
            }

            .author-box {
                padding: 20px;
                gap: 16px;
            }

            .author-box__avatar img {
                width: 64px;
                height: 64px;
            }

            .author-box__name {
                font-size: 1rem;
            }

            .author-box__bio {
                font-size: 0.85rem;
            }

            .nav-previous a,
            .nav-next a {
                padding: 12px;
                font-size: 0.9rem;
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
