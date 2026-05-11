/* ============================================================
   AVANA SURGICAL — RUNTIME HEADER/FOOTER PARTIAL INJECTOR

   Usage:
     <div data-include="/partials/header.html"></div>
     <div data-include="/partials/footer.html"></div>
     <script src="/assets/js/include-partials.js" defer></script>

   Each [data-include] element has its innerHTML replaced with the
   fetched partial. After ALL partials resolve (success or fail),
   a window-level "partials:loaded" event fires so dependent
   behaviour scripts (sticky header, mobile menu, mega-menu)
   can wire up to elements that didn't exist at DOMContentLoaded.
   ============================================================ */

(function () {
    'use strict';

    async function loadOne(el) {
        const url = el.getAttribute('data-include');
        if (!url) return;
        try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            // Replace the wrapper entirely so we don't introduce
            // an unnecessary <div> in the document tree.
            const tmp = document.createElement('template');
            tmp.innerHTML = html;
            el.replaceWith(tmp.content);
        } catch (err) {
            console.error('include-partials: failed to load', url, err);
            el.innerHTML = `<!-- partial ${url} failed: ${err.message} -->`;
        }
    }

    async function loadAll() {
        const nodes = Array.from(document.querySelectorAll('[data-include]'));
        await Promise.all(nodes.map(loadOne));

        // Set the footer year automatically (if footer is present).
        const yr = document.querySelector('[data-footer-year]');
        if (yr) yr.textContent = String(new Date().getFullYear());

        // Signal that partials are in the DOM — behaviour scripts listen for this.
        document.dispatchEvent(new CustomEvent('partials:loaded'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAll);
    } else {
        loadAll();
    }
})();
