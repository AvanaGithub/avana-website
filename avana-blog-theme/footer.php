<?php
/**
 * The footer for our theme
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
    </main>

    <!-- Footer -->
    <footer class="site-footer">
        <div class="container">
            <div class="site-footer__grid">

                <!-- Brand column -->
                <div class="site-footer__column site-footer__brand">
                    <div class="site-footer__logo">
                        <img src="<?php echo esc_url( get_template_directory_uri() ); ?>/images/footer-logo.svg" alt="Avana Surgical" class="footer-logo-image" onerror="this.style.display='none'">
                        <span class="footer-logo-text">Orthotics Blog</span>
                    </div>
                    <p class="site-footer__desc">
                        <?php esc_html_e( 'Doctor-recommended orthotics, bracing and pain relief insights from Avana Surgical Systems — trusted by 1 lakh+ patients across India.', 'avana-blog-theme' ); ?>
                    </p>
                    <div class="site-footer__contact-info">
                        <a href="mailto:info@avanasurgical.com">📧 info@avanasurgical.com</a>
                        <a href="tel:04422331061">📞 044-2233 1061</a>
                        <span class="site-footer__address">📍 Chennai, Tamil Nadu, India</span>
                    </div>
                    <div class="site-footer__socials">
                        <a href="https://www.linkedin.com/company/avana-surgical-systems-pvt-ltd/" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'LinkedIn', 'avana-blog-theme' ); ?>">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" fill="currentColor"/></svg>
                        </a>
                        <a href="https://www.instagram.com/avana_surgical/" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Instagram', 'avana-blog-theme' ); ?>">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.7 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.21-.01 3.58-.07 4.85-.15 3.22-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85.15-3.23 1.66-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24c3.26 0 3.67-.01 4.95-.07 4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95 0-3.26-.01-3.67-.07-4.95-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" fill="currentColor"/></svg>
                        </a>
                        <a href="https://www.facebook.com/avanamedical" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Facebook', 'avana-blog-theme' ); ?>">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.45 18.63.07 12 .07S0 5.45 0 12.07c0 5.99 4.39 10.95 10.13 11.86v-8.39H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.39C19.61 23.02 24 18.06 24 12.07z" fill="currentColor"/></svg>
                        </a>
                        <a href="https://www.youtube.com/@avanamedical/videos" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'YouTube', 'avana-blog-theme' ); ?>">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.01 3.01 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" fill="currentColor"/></svg>
                        </a>
                    </div>
                </div>

                <!-- For Patients column -->
                <div class="site-footer__column">
                    <h4 class="site-footer__heading"><?php esc_html_e( 'For Patients', 'avana-blog-theme' ); ?></h4>
                    <ul class="site-footer__links">
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#products' ); ?>"><?php esc_html_e( 'Freestyle OA Brace', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#products' ); ?>"><?php esc_html_e( 'Cold Therapy', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#products' ); ?>"><?php esc_html_e( 'Post-op Care', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#products' ); ?>"><?php esc_html_e( 'Spine Bracing', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#testimonials' ); ?>"><?php esc_html_e( 'Patient Stories', 'avana-blog-theme' ); ?></a></li>
                    </ul>
                </div>

                <!-- For Surgeons column -->
                <div class="site-footer__column">
                    <h4 class="site-footer__heading"><?php esc_html_e( 'For Surgeons', 'avana-blog-theme' ); ?></h4>
                    <ul class="site-footer__links">
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#for-doctors' ); ?>"><?php esc_html_e( 'RiwoSpine Products', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#for-doctors' ); ?>"><?php esc_html_e( 'Education & CME', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#testimonials' ); ?>"><?php esc_html_e( 'Doctor Testimonials', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#enquiry' ); ?>"><?php esc_html_e( 'Partner With Us', 'avana-blog-theme' ); ?></a></li>
                    </ul>
                </div>

                <!-- Company column -->
                <div class="site-footer__column">
                    <h4 class="site-footer__heading"><?php esc_html_e( 'Company', 'avana-blog-theme' ); ?></h4>
                    <ul class="site-footer__links">
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html' ); ?>"><?php esc_html_e( 'Home', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#about' ); ?>"><?php esc_html_e( 'About Us', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( $avana_main_site . '/careers.html' ); ?>"><?php esc_html_e( 'Careers', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Blog', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( $avana_main_site . '/index.html#enquiry' ); ?>"><?php esc_html_e( 'Contact', 'avana-blog-theme' ); ?></a></li>
                        <li><a href="<?php echo esc_url( $avana_main_site . '/privacy.html' ); ?>"><?php esc_html_e( 'Privacy Policy', 'avana-blog-theme' ); ?></a></li>
                    </ul>
                </div>

            </div>

            <!-- Trust strip -->
            <div class="site-footer__trust">
                <div class="trust-item">
                    <span class="trust-item__icon">✓</span>
                    <span><?php esc_html_e( 'Doctor-Recommended', 'avana-blog-theme' ); ?></span>
                </div>
                <div class="trust-item">
                    <span class="trust-item__icon">🌍</span>
                    <span><?php esc_html_e( 'International Brands', 'avana-blog-theme' ); ?></span>
                </div>
                <div class="trust-item">
                    <span class="trust-item__icon">🚚</span>
                    <span><?php esc_html_e( 'Pan-India Delivery', 'avana-blog-theme' ); ?></span>
                </div>
                <div class="trust-item">
                    <span class="trust-item__icon">💬</span>
                    <span><?php esc_html_e( '1 Lakh+ Patients Trust Us', 'avana-blog-theme' ); ?></span>
                </div>
            </div>

            <div class="site-footer__bottom">
                <p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php esc_html_e( 'Avana Surgical Systems Pvt Ltd. All rights reserved.', 'avana-blog-theme' ); ?></p>
                <div class="site-footer__bottom-links">
                    <a href="<?php echo esc_url( $avana_main_site . '/privacy.html' ); ?>"><?php esc_html_e( 'Privacy', 'avana-blog-theme' ); ?></a>
                    <span class="dot">·</span>
                    <a href="<?php echo esc_url( $avana_main_site . '/terms.html' ); ?>"><?php esc_html_e( 'Terms', 'avana-blog-theme' ); ?></a>
                    <span class="dot">·</span>
                    <a href="<?php echo esc_url( $avana_main_site ); ?>"><?php esc_html_e( 'Main Site', 'avana-blog-theme' ); ?></a>
                </div>
            </div>
        </div>
    </footer>

    <!-- Back to top button -->
    <button class="back-to-top" aria-label="<?php esc_attr_e( 'Back to top', 'avana-blog-theme' ); ?>">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>
    </button>

    <style>
        .site-footer {
            background-color: #1a2836;
            color: var(--color-white);
            padding: 64px 0 24px;
        }

        .site-footer__grid {
            display: grid;
            grid-template-columns: 1.6fr 1fr 1fr 1fr;
            gap: 48px;
            margin-bottom: 48px;
        }

        .site-footer__brand { /* wider column */ }

        .site-footer__logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 18px;
        }

        .footer-logo-image {
            height: 48px;
            width: auto;
            display: block;
        }

        .footer-logo-text {
            font-family: 'Playfair Display', serif;
            font-size: 1.25rem;
            font-weight: 700;
            letter-spacing: 0.5px;
            color: var(--color-white);
            border-left: 2px solid var(--color-accent);
            padding-left: 12px;
            line-height: 1;
        }

        .site-footer__desc {
            color: rgba(255, 255, 255, 0.75);
            margin-bottom: 20px;
            font-size: 0.95rem;
            line-height: 1.7;
        }

        .site-footer__contact-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
        }

        .site-footer__contact-info a,
        .site-footer__address {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.3s;
        }

        .site-footer__contact-info a:hover {
            color: var(--color-accent);
            text-decoration: none;
        }

        .site-footer__socials {
            display: flex;
            gap: 12px;
        }

        .site-footer__socials a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.08);
            color: var(--color-white);
            transition: all 0.3s;
            text-decoration: none;
        }

        .site-footer__socials a:hover {
            background-color: var(--color-accent);
            transform: translateY(-2px);
        }

        .site-footer__socials svg {
            width: 16px;
            height: 16px;
        }

        .site-footer__heading {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: var(--color-white);
            letter-spacing: 0.5px;
        }

        .site-footer__links {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .site-footer__links li {
            margin-bottom: 12px;
        }

        .site-footer__links a {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            font-size: 0.95rem;
            transition: color 0.3s;
        }

        .site-footer__links a:hover {
            color: var(--color-accent);
            text-decoration: none;
        }

        /* Trust strip */
        .site-footer__trust {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 24px 0;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 24px;
        }

        .trust-item {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: rgba(255, 255, 255, 0.85);
            font-size: 0.9rem;
            font-weight: 500;
        }

        .trust-item__icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: rgba(177, 140, 87, 0.15);
            color: var(--color-accent);
            font-size: 0.85rem;
        }

        .site-footer__bottom {
            padding-top: 8px;
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.875rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
        }

        .site-footer__bottom p {
            margin: 0;
        }

        .site-footer__bottom-links {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .site-footer__bottom-links a {
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            transition: color 0.3s;
        }

        .site-footer__bottom-links a:hover {
            color: var(--color-accent);
        }

        .site-footer__bottom-links .dot {
            color: rgba(255, 255, 255, 0.3);
        }

        /* Back to top */
        .back-to-top {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background-color: var(--color-accent);
            color: var(--color-white);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s;
            z-index: 99;
            box-shadow: 0 4px 12px rgba(36, 52, 71, 0.2);
        }

        .back-to-top.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .back-to-top:hover {
            background-color: var(--color-accent-hover);
            transform: translateY(-4px);
        }

        .back-to-top svg {
            width: 20px;
            height: 20px;
        }

        /* Responsive */
        @media (max-width: 968px) {
            .site-footer { padding: 48px 0 20px; }

            .site-footer__grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 32px;
            }

            .site-footer__brand {
                grid-column: 1 / -1;
            }

            .site-footer__trust {
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
            }
        }

        @media (max-width: 640px) {
            .site-footer { padding: 36px 0 16px; }

            .site-footer__grid {
                grid-template-columns: 1fr;
                gap: 28px;
                margin-bottom: 28px;
            }

            .site-footer__brand { grid-column: auto; }

            .site-footer__heading {
                font-size: 0.95rem;
                margin-bottom: 14px;
            }

            .footer-logo-image { height: 40px; }
            .footer-logo-text { font-size: 1.05rem; padding-left: 10px; }

            .site-footer__desc {
                font-size: 0.875rem;
                margin-bottom: 14px;
            }

            .site-footer__socials a {
                width: 32px;
                height: 32px;
            }

            .site-footer__links a,
            .site-footer__contact-info a,
            .site-footer__address {
                font-size: 0.875rem;
            }

            .site-footer__trust {
                grid-template-columns: 1fr;
                gap: 12px;
                padding: 16px 0;
            }

            .trust-item { font-size: 0.85rem; }

            .site-footer__bottom {
                flex-direction: column;
                font-size: 0.8rem;
                text-align: center;
            }

            .back-to-top {
                width: 40px;
                height: 40px;
                bottom: 16px;
                right: 16px;
            }
        }
    </style>

    <?php wp_footer(); ?>
</body>
</html>
