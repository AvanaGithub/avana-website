/* ============================================================
   AVANA GHOST THEME — main.js  (v1.0.8)
   Header/mobile-nav/mega-menu behavior extracted from the main
   site (assets/js/header-behavior.js) plus the theme's own
   back-to-top button + footer-year helper.
   ============================================================ */

(function () {
    'use strict';

    /* ------ Sticky header shadow + back-to-top visibility ------ */
    function bindStickyHeader() {
        var header = document.getElementById('site-header');
        var backToTop = document.getElementById('back-to-top');
        if (!header && !backToTop) return;

        var onScroll = function () {
            var y = window.pageYOffset;
            if (header) header.classList.toggle('scrolled', y > 100);
            if (backToTop) backToTop.classList.toggle('visible', y > 400);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        if (backToTop) {
            backToTop.addEventListener('click', function (e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    /* ------ Mobile menu toggle + accordion sub-menus ------ */
    function bindMobileMenu() {
        var toggle = document.querySelector('.mobile-menu-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('open');
            toggle.classList.toggle('active', isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.classList.toggle('mobile-nav-open', isOpen);
        });

        nav.querySelectorAll('.mobile-nav__group-toggle').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var group = btn.closest('.mobile-nav__group');
                if (!group) return;
                var isOpen = group.classList.toggle('open');
                btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        });
    }

    /* ------ Solutions mega-menu (hover + click + Escape) ------ */
    function bindMegaMenu() {
        var items = document.querySelectorAll('.main-nav__item--has-mega');
        items.forEach(function (item) {
            var link = item.querySelector('.main-nav__link');
            var menu = item.querySelector('.mega-menu');
            if (!link || !menu) return;

            item.addEventListener('mouseenter', function () {
                link.setAttribute('aria-expanded', 'true');
            });
            item.addEventListener('mouseleave', function () {
                link.setAttribute('aria-expanded', 'false');
            });

            link.addEventListener('click', function (e) {
                e.preventDefault();
                var isOpen = item.classList.toggle('mega-open');
                link.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });

            item.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    item.classList.remove('mega-open');
                    link.setAttribute('aria-expanded', 'false');
                    link.focus();
                }
            });
        });

        document.addEventListener('click', function (e) {
            items.forEach(function (item) {
                if (!item.contains(e.target)) item.classList.remove('mega-open');
            });
        });
    }

    /* ------ Auto-update footer year ------ */
    function bindFooterYear() {
        var yearEl = document.querySelector('[data-footer-year]');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    function init() {
        bindStickyHeader();
        bindMobileMenu();
        bindMegaMenu();
        bindFooterYear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
