<?php
/**
 * The template for displaying comments
 *
 * @package Avana_Blog_Theme
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( post_password_required() ) {
    return;
}
?>

<div id="comments" class="comments-area">
    <?php
    if ( have_comments() ) :
        ?>
        <h2 class="comments-title">
            <?php
            $comment_count = get_comments_number();
            if ( 1 === intval( $comment_count ) ) {
                esc_html_e( '1 Comment', 'avana-blog-theme' );
            } else {
                echo esc_html(
                    sprintf(
                        _n( '%s Comment', '%s Comments', $comment_count, 'avana-blog-theme' ),
                        $comment_count
                    )
                );
            }
            ?>
        </h2>

        <ol class="comment-list">
            <?php
            wp_list_comments( array(
                'style' => 'ol',
                'short_ping' => true,
                'avatar_size' => 48,
            ) );
            ?>
        </ol>

        <?php
        the_comments_pagination(
            array(
                'prev_text' => esc_html__( '← Older Comments', 'avana-blog-theme' ),
                'next_text' => esc_html__( 'Newer Comments →', 'avana-blog-theme' ),
            )
        );
    endif;

    if ( ! comments_open() && get_comments_number() && post_type_supports( get_post_type(), 'comments' ) ) :
        ?>
        <p class="no-comments"><?php esc_html_e( 'Comments are closed.', 'avana-blog-theme' ); ?></p>
        <?php
    endif;

    comment_form(
        array(
            'comment_field' => '<p class="comment-form-comment"><label for="comment">' . esc_html__( 'Comment', 'avana-blog-theme' ) . '</label><textarea id="comment" name="comment" cols="45" rows="8" required></textarea></p>',
            'class_form' => 'comment-form',
            'class_submit' => 'btn btn--primary',
        )
    );
    ?>
</div>

<style>
    .comments-area {
        margin-top: 48px;
        padding-top: 48px;
        border-top: 1px solid var(--color-border);
    }

    .comments-title {
        font-size: 1.5rem;
        color: var(--color-primary);
        margin-bottom: 32px;
    }

    .comment-list {
        list-style: none;
        padding: 0;
        margin-bottom: 32px;
    }

    .comment-list li {
        margin-bottom: 32px;
        padding: 24px;
        background-color: var(--color-white);
        border: 1px solid var(--color-border);
        border-radius: 12px;
    }

    .comment-list .children {
        list-style: none;
        padding: 0;
        margin-top: 20px;
        margin-left: 20px;
    }

    .comment-author,
    .comment-metadata {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        font-size: 0.9rem;
    }

    .comment-author img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
    }

    .comment-author cite {
        font-style: normal;
        font-weight: 600;
        color: var(--color-primary);
    }

    .comment-metadata a {
        color: var(--color-muted);
        text-decoration: none;
        transition: color 0.3s;
    }

    .comment-metadata a:hover {
        color: var(--color-accent);
    }

    .comment-text {
        color: var(--color-text);
        line-height: 1.7;
        margin-bottom: 12px;
    }

    .comment-reply-link {
        font-size: 0.85rem;
        color: var(--color-accent);
        font-weight: 600;
    }

    .comment-reply-link:hover {
        color: var(--color-accent-hover);
        text-decoration: underline;
    }

    .comment-form {
        margin-top: 32px;
        padding: 32px;
        background-color: var(--color-white);
        border: 1px solid var(--color-border);
        border-radius: 12px;
    }

    .comment-form-comment,
    .comment-form-author,
    .comment-form-email,
    .comment-form-url {
        margin-bottom: 20px;
    }

    .comment-form label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: var(--color-primary);
        font-size: 0.95rem;
    }

    .comment-form textarea,
    .comment-form input[type="text"],
    .comment-form input[type="email"],
    .comment-form input[type="url"] {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.95rem;
    }

    .comment-form textarea {
        min-height: 120px;
        resize: vertical;
    }

    .comment-form input:focus,
    .comment-form textarea:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(177, 140, 87, 0.1);
    }

    .form-submit {
        margin-top: 20px;
    }

    .form-submit input[type="submit"] {
        padding: 14px 28px;
        min-height: 44px;
    }

    .no-comments {
        color: var(--color-muted);
        font-size: 1rem;
        text-align: center;
        padding: 40px 20px;
    }

    .comments-pagination {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin: 32px 0;
        flex-wrap: wrap;
    }

    .comments-pagination a,
    .comments-pagination span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s;
    }

    .comments-pagination a:hover {
        background-color: var(--color-accent);
        color: var(--color-white);
        border-color: var(--color-accent);
        text-decoration: none;
    }

    /* Responsive */
    @media (max-width: 640px) {
        .comments-area {
            margin-top: 32px;
            padding-top: 32px;
        }

        .comments-title {
            font-size: 1.2rem;
            margin-bottom: 20px;
        }

        .comment-list li {
            margin-bottom: 16px;
            padding: 16px;
        }

        .comment-form {
            margin-top: 20px;
            padding: 16px;
        }

        .comment-form textarea,
        .comment-form input {
            font-size: 16px;
            padding: 10px;
        }
    }
</style>
