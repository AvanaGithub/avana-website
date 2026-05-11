<?php
/**
 * The header for our theme
 *
 * @package Avana_Blog_Theme
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Main site base URL — change this if your main site URL differs
$avana_main_site = 'https://www.avanasurgical.com';
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <?php wp_body_open(); ?>

    <!-- Skip link -->
    <a href="#main" class="skip-link"><?php esc_html_e( 'Skip to content', 'avana-blog-theme' ); ?></a>

    <!-- Top bar -->
    <div class="top-bar">
        <div class="container">
            <div class="top-bar__left">
                <a href="mailto:info@avanasurgical.com" class="top-bar__item">
                    📧 info@avanasurgical.com
                </a>
                <a href="tel:04422331061" class="top-bar__item">
                    📞 044-2233 1061
                </a>
            </div>
            <div class="top-bar__right">
                <a href="https://www.linkedin.com/company/avana-surgical-systems-pvt-ltd/posts/?feedView=all" class="top-bar__social" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Avana Surgical on LinkedIn', 'avana-blog-theme' ); ?>">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>
                </a>
                <a href="https://www.instagram.com/avana_surgical/" class="top-bar__social" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Avana Surgical on Instagram', 'avana-blog-theme' ); ?>">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.7 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.21-.01 3.58-.07 4.85-.15 3.22-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85.15-3.23 1.66-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24c3.26 0 3.67-.01 4.95-.07 4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95 0-3.26-.01-3.67-.07-4.95-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
                </a>
                <a href="https://www.facebook.com/avanamedical" class="top-bar__social" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Avana Surgical on Facebook', 'avana-blog-theme' ); ?>">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.45 18.63.07 12 .07S0 5.45 0 12.07c0 5.99 4.39 10.95 10.13 11.86v-8.39H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.39C19.61 23.02 24 18.06 24 12.07z"/></svg>
                </a>
                <a href="https://www.youtube.com/@avanamedical/videos" class="top-bar__social" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Avana Surgical on YouTube', 'avana-blog-theme' ); ?>">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.01 3.01 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>
                </a>
            </div>
        </div>
    </div>

    <!-- Header -->
    <header class="site-header" id="site-header">
        <div class="container">
            <div class="site-header__inner">
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="site-logo" aria-label="<?php esc_attr_e( 'Orthotics Blog — Home', 'avana-blog-theme' ); ?>">
                    <img src="<?php echo esc_url( get_template_directory_uri() ); ?>/images/header-logo.svg" alt="Avana Surgical" class="logo-image" onerror="this.style.display='none'">
                    <span class="site-logo-text">Orthotics Blog</span>
                </a>

                <!-- Main Navigation -->
                <nav class="main-nav" aria-label="<?php esc_attr_e( 'Main navigation', 'avana-blog-theme' ); ?>">
                    <?php
                    if ( has_nav_menu( 'primary' ) ) {
                        wp_nav_menu( array(
                            'theme_location' => 'primary',
                            'menu_class'     => 'main-nav__list',
                            'container'      => false,
                            'depth'          => 2,
                        ) );
                    } else {
                        ?>
                        <ul class="main-nav__list">
                            <li><a href="<?php echo esc_url( $avana_main_site . '/index.html' ); ?>" class="main-nav__link"><?php esc_html_e( 'Home', 'avana-blog-theme' ); ?></a></li>
                            <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#products' ); ?>" class="main-nav__link"><?php esc_html_e( 'Products', 'avana-blog-theme' ); ?></a></li>
                            <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#for-doctors' ); ?>" class="main-nav__link"><?php esc_html_e( 'For Doctors', 'avana-blog-theme' ); ?></a></li>
                            <li><a href="<?php echo esc_url( $avana_main_site . '/careers.html' ); ?>" class="main-nav__link"><?php esc_html_e( 'Careers', 'avana-blog-theme' ); ?></a></li>
                            <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="main-nav__link active"><?php esc_html_e( 'Blog', 'avana-blog-theme' ); ?></a></li>
                            <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#about' ); ?>" class="main-nav__link"><?php esc_html_e( 'About', 'avana-blog-theme' ); ?></a></li>
                        </ul>
                        <?php
                    }
                    ?>
                </nav>

                <a href="<?php echo esc_url( $avana_main_site . '/index.html#enquiry' ); ?>" class="header-cta"><?php esc_html_e( 'Get a Consultation', 'avana-blog-theme' ); ?></a>

                <!-- Mobile menu toggle -->
                <button class="mobile-menu-toggle" aria-label="<?php esc_attr_e( 'Toggle navigation', 'avana-blog-theme' ); ?>" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
            </div>

            <!-- Mobile Nav -->
            <nav class="mobile-nav" aria-label="<?php esc_attr_e( 'Mobile navigation', 'avana-blog-theme' ); ?>">
                <ul class="mobile-nav__list">
                    <li><a href="<?php echo esc_url( $avana_main_site . '/index.html' ); ?>"><?php esc_html_e( 'Home', 'avana-blog-theme' ); ?></a></li>
                    <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#products' ); ?>"><?php esc_html_e( 'Products', 'avana-blog-theme' ); ?></a></li>
                    <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#for-doctors' ); ?>"><?php esc_html_e( 'For Doctors', 'avana-blog-theme' ); ?></a></li>
                    <li><a href="<?php echo esc_url( $avana_main_site . '/careers.html' ); ?>"><?php esc_html_e( 'Careers', 'avana-blog-theme' ); ?></a></li>
                    <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Blog', 'avana-blog-theme' ); ?></a></li>
                    <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#about' ); ?>"><?php esc_html_e( 'About', 'avana-blog-theme' ); ?></a></li>
                    <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#enquiry' ); ?>" class="mobile-nav__cta"><?php esc_html_e( 'Get a Consultation', 'avana-blog-theme' ); ?></a></li>
                </ul>
            </nav>
        </div>
    </header>

    <style>
        .top-bar {
            background-color: var(--color-primary);
            color: var(--color-white);
            padding: 12px 0;
            font-size: 14px;
        }

        .top-bar .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .top-bar__left {
            display: flex;
            gap: 24px;
        }

        .top-bar__item {
            color: var(--color-white);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: opacity 0.3s;
        }

        .top-bar__item:hover { opacity: 0.8; }

        .top-bar__right {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .top-bar__social {
            color: var(--color-white);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.08);
            transition: all 0.3s;
        }

        .top-bar__social:hover {
            background-color: var(--color-accent);
            color: var(--color-white);
            transform: translateY(-2px);
        }

        .top-bar__social svg {
            width: 14px;
            height: 14px;
            fill: currentColor;
        }

        .site-header {
            background-color: var(--color-white);
            padding: 16px 0;
            border-bottom: 1px solid var(--color-border);
            position: sticky;
            top: 0;
            z-index: 100;
            transition: box-shadow 0.3s;
        }

        .site-header.scrolled {
            box-shadow: 0 4px 12px rgba(36, 52, 71, 0.1);
        }

        .site-header__inner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 24px;
        }

        .site-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            flex-shrink: 0;
        }

        .site-logo .logo-image {
            height: 44px;
            width: auto;
            display: block;
        }

        .site-logo-text {
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            color: var(--color-primary);
            font-size: 1.25rem;
            letter-spacing: 0.5px;
            line-height: 1;
            border-left: 2px solid var(--color-accent);
            padding-left: 12px;
        }

        .main-nav__list {
            display: flex;
            gap: 32px;
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .main-nav__list a,
        .main-nav__link {
            color: var(--color-text);
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            transition: color 0.3s;
        }

        .main-nav__list a:hover,
        .main-nav__link:hover,
        .main-nav__list a.active,
        .main-nav__link.active {
            color: var(--color-accent);
        }

        .header-cta {
            background-color: var(--color-accent);
            color: var(--color-white);
            padding: 10px 22px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
            transition: background 0.3s;
            white-space: nowrap;
        }

        .header-cta:hover {
            background-color: var(--color-accent-hover);
            text-decoration: none;
            color: var(--color-white);
        }

        /* Mobile menu toggle */
        .mobile-menu-toggle {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            flex-direction: column;
            gap: 5px;
        }

        .mobile-menu-toggle span {
            display: block;
            width: 26px;
            height: 2px;
            background-color: var(--color-primary);
            transition: all 0.3s;
        }

        .mobile-menu-toggle.active span:nth-child(1) {
            transform: translateY(7px) rotate(45deg);
        }

        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }

        .mobile-menu-toggle.active span:nth-child(3) {
            transform: translateY(-7px) rotate(-45deg);
        }

        .mobile-nav {
            display: none;
            padding: 16px 0;
            border-top: 1px solid var(--color-border);
            margin-top: 16px;
        }

        .mobile-nav.open {
            display: block;
        }

        .mobile-nav__list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .mobile-nav__list a {
            display: block;
            padding: 12px 8px;
            color: var(--color-text);
            text-decoration: none;
            font-weight: 500;
            border-radius: 6px;
            transition: all 0.3s;
        }

        .mobile-nav__list a:hover {
            background-color: var(--color-bg);
            color: var(--color-accent);
        }

        .mobile-nav__cta {
            background-color: var(--color-accent);
            color: var(--color-white) !important;
            text-align: center;
            margin-top: 8px;
        }

        .mobile-nav__cta:hover {
            background-color: var(--color-accent-hover);
            color: var(--color-white) !important;
        }

        /* Responsive */
        @media (max-width: 968px) {
            .top-bar__left { display: none; }
            .top-bar .container { justify-content: center; }
            .main-nav { display: none; }
            .header-cta { display: none; }
            .mobile-menu-toggle { display: flex; }
            .site-logo .logo-image { height: 38px; }
            .site-logo-text { font-size: 1.05rem; padding-left: 10px; }
        }

        @media (max-width: 640px) {
            .top-bar { padding: 8px 0; font-size: 12px; }
            .top-bar__social { width: 28px; height: 28px; }
            .top-bar__social svg { width: 12px; height: 12px; }
            .site-header { padding: 12px 0; }
            .site-logo .logo-image { height: 34px; }
            .site-logo-text { font-size: 0.95rem; padding-left: 8px; }
        }
    </style>

    <script>
        (function() {
            var toggle = document.querySelector('.mobile-menu-toggle');
            var mobileNav = document.querySelector('.mobile-nav');
            if (toggle && mobileNav) {
                toggle.addEventListener('click', function() {
                    var isOpen = mobileNav.classList.toggle('open');
                    toggle.classList.toggle('active', isOpen);
                    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                });
            }
        })();
    </script>

    <main id="main" class="site-main">
