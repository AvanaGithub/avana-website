/* ============================================================
   AVANA GHOST THEME — main.js
   Mobile menu toggle + sticky header shadow + back-to-top
   ============================================================ */

(function () {
    'use strict';

    /* ------ Sticky header shadow on scroll ------ */
    var header = document.getElementById('site-header');
    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('scrolled', window.scrollY > 10);
        }, { passive: true });
    }

    /* ------ Mobile menu toggle ------ */
    var toggle = document.getElementById('mobile-menu-toggle');
    var mobileNav = document.getElementById('mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var isOpen = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!isOpen));
            if (isOpen) {
                mobileNav.setAttribute('hidden', '');
            } else {
                mobileNav.removeAttribute('hidden');
            }
        });

        // Close mobile nav when any link inside is clicked
        mobileNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                toggle.setAttribute('aria-expanded', 'false');
                mobileNav.setAttribute('hidden', '');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', function (e) {
            if (!header.contains(e.target)) {
                toggle.setAttribute('aria-expanded', 'false');
                mobileNav.setAttribute('hidden', '');
            }
        });
    }

    /* ------ Back to top ------ */
    var btt = document.getElementById('back-to-top');
    if (btt) {
        window.addEventListener('scroll', function () {
            btt.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });

        btt.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ------ Auto-update footer year ------ */
    var yearEl = document.querySelector('[data-footer-year]');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
})();
