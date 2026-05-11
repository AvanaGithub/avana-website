/* ============================================================
   AVANA SURGICAL — HEADER BEHAVIOUR

   Listens for the partials:loaded event then attaches:
     - Sticky header (.scrolled class on scroll)
     - Mobile menu toggle (hamburger)
     - Mobile sub-menu accordions (Solutions group)
     - Solutions mega-menu (hover, focus-within, escape-to-close)
     - Active link highlighting based on URL
     - Back-to-top button visibility + click
   ============================================================ */

(function () {
    'use strict';

    function bindStickyHeader() {
        const header = document.getElementById('site-header');
        const backToTop = document.getElementById('back-to-top');
        if (!header && !backToTop) return;

        const onScroll = () => {
            const y = window.pageYOffset;
            if (header) header.classList.toggle('scrolled', y > 100);
            if (backToTop) backToTop.classList.toggle('visible', y > 400);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        if (backToTop) {
            backToTop.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    function bindMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            toggle.classList.toggle('active', isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.classList.toggle('mobile-nav-open', isOpen);
        });

        // Mobile sub-menu accordion (the Solutions group)
        nav.querySelectorAll('.mobile-nav__group-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const group = btn.closest('.mobile-nav__group');
                if (!group) return;
                const isOpen = group.classList.toggle('open');
                btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        });
    }

    function bindMegaMenu() {
        const items = document.querySelectorAll('.main-nav__item--has-mega');
        items.forEach(item => {
            const link = item.querySelector('.main-nav__link');
            const menu = item.querySelector('.mega-menu');
            if (!link || !menu) return;

            // Open on hover (CSS already handles :hover, but we also sync aria-expanded)
            item.addEventListener('mouseenter', () => link.setAttribute('aria-expanded', 'true'));
            item.addEventListener('mouseleave', () => link.setAttribute('aria-expanded', 'false'));

            // Keyboard / tap support: toggle on the trigger
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const isOpen = item.classList.toggle('mega-open');
                link.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });

            // Close on Escape from anywhere inside
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    item.classList.remove('mega-open');
                    link.setAttribute('aria-expanded', 'false');
                    link.focus();
                }
            });
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            items.forEach(item => {
                if (!item.contains(e.target)) item.classList.remove('mega-open');
            });
        });
    }

    function highlightActiveNav() {
        const path = window.location.pathname;
        document.querySelectorAll('.main-nav__link, .mobile-nav__list a').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (!href || href === '#') return;
            // Match on prefix for /solutions/, /audiences/, /conditions/
            if (path === href || (href.endsWith('/') && path.startsWith(href) && href !== '/')) {
                a.classList.add('is-active');
            }
            if (path.startsWith('/solutions/') || path.startsWith('/audiences/') || path.startsWith('/conditions/')) {
                const solutionsItem = document.querySelector('[data-nav="solutions"] .main-nav__link');
                if (solutionsItem) solutionsItem.classList.add('is-active');
            }
        });
    }

    function init() {
        bindStickyHeader();
        bindMobileMenu();
        bindMegaMenu();
        highlightActiveNav();
    }

    // Run when partials are in the DOM. If they're already there (e.g. on a
    // page that inlines the header without using include-partials), still run.
    if (document.querySelector('#site-header')) {
        init();
    } else {
        document.addEventListener('partials:loaded', init);
    }
})();
