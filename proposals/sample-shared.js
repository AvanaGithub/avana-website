/* ============================================================
   Tiny client-side glue for proposal sample pages: FAQ accordion +
   back-to-top button. Solution-loader.js isn't loaded on samples
   (they're static), so we wire these here.
   ============================================================ */
(function () {
    'use strict';

    document.querySelectorAll('.faq-item__question').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = btn.closest('.faq-item');
            var isOpen = item.classList.toggle('faq-item--open');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    });

    var backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('visible', window.pageYOffset > 400);
        }, { passive: true });
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
