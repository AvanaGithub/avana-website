/* ============================================================
   AVANA — "Enquire Now" modal
   Routing logic:
     - Homepage (has <section id="enquiry">) → smooth-scroll to that
       section.
     - Any other page that has #enquiry-modal in the DOM → open the
       modal popup.
     - Fallback → navigate to homepage form.
   Submits via Web3Forms AJAX (no page redirect).
   Loaded on every non-homepage page.
   ============================================================ */

(function () {
    'use strict';

    /* ---------- open / close ---------- */
    function openModal() {
        const modal = document.getElementById('enquiry-modal');
        if (!modal) return;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        const firstInput = modal.querySelector('input[name="name"]');
        if (firstInput) firstInput.focus();
    }

    function closeModal() {
        const modal = document.getElementById('enquiry-modal');
        if (!modal) return;
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    /* ---------- global click interceptor for "Enquire Now" ---------- */
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a, button');
        if (!link) return;

        const href = (link.getAttribute('href') || '').trim();
        const text = link.textContent.trim();

        // Match either the new CTA label or the old one (defensive — in
        // case any external link or stale cache still uses the legacy text).
        const isEnquireCta =
            href === '#enquiry-modal' ||
            href === 'index.html#enquiry' ||
            href === '#enquiry' ||
            text === 'Enquire Now' ||
            text === 'Talk to a Specialist' ||
            text === 'Find the Right Solution' ||
            text === 'Find the Right Solution →' ||
            text === 'Speak to a Product Specialist';

        if (!isEnquireCta) return;
        e.preventDefault();

        // Priority 1 — homepage in-page form section
        const homepageSection = document.getElementById('enquiry');
        if (homepageSection) {
            homepageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        // Priority 2 — modal exists on this page (any non-homepage page)
        if (document.getElementById('enquiry-modal')) {
            openModal();
            return;
        }

        // Priority 3 — neither: send user to homepage form
        window.location.href = 'index.html#enquiry';
    });

    /* ---------- close triggers (delegated so partial injection is fine) ---------- */
    document.addEventListener('click', function (e) {
        if (e.target.closest('#enquiry-modal-close')) {
            closeModal();
            return;
        }
        if (e.target.id === 'enquiry-modal-overlay') {
            closeModal();
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        const modal = document.getElementById('enquiry-modal');
        if (modal && !modal.hidden) closeModal();
    });

    /* ---------- form submission (Web3Forms AJAX) ---------- */
    // Delegated submit so it works even when the modal HTML is injected
    // later via include-partials.js.
    document.addEventListener('submit', async function (e) {
        const form = e.target;
        if (!form || form.id !== 'enquiry-modal-form') return;

        e.preventDefault();

        const submit  = document.getElementById('enquiry-modal-submit');
        const success = document.getElementById('enquiry-modal-success');
        const error   = document.getElementById('enquiry-modal-error');

        if (success) success.hidden = true;
        if (error)   error.hidden   = true;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (submit) {
            submit.disabled = true;
            submit.textContent = 'Sending…';
        }

        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            });
            const json = await res.json();

            if (json.success) {
                form.reset();
                if (success) success.hidden = false;
            } else {
                if (error) error.hidden = false;
            }
        } catch (_) {
            if (error) error.hidden = false;
        } finally {
            if (submit) {
                submit.disabled = false;
                submit.textContent = 'Submit Enquiry';
            }
        }
    });
})();
