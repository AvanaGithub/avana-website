/* ============================================================
   AVANA — "Talk to a Specialist" modal
   Handles open/close and Web3Forms AJAX submission.
   Loaded by solution-template.html on all solution pages.
   ============================================================ */

(function () {
    'use strict';

    const modal   = document.getElementById('enquiry-modal');
    const overlay = document.getElementById('enquiry-modal-overlay');
    const closeBtn = document.getElementById('enquiry-modal-close');
    const form    = document.getElementById('enquiry-modal-form');
    const submit  = document.getElementById('enquiry-modal-submit');
    const success = document.getElementById('enquiry-modal-success');
    const error   = document.getElementById('enquiry-modal-error');

    if (!modal) return; // not on this page

    /* ---------- open / close ---------- */
    function openModal() {
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        modal.querySelector('input[name="name"]').focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    /* ---------- intercept "Talk to a Specialist" clicks ---------- */
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a, button');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        const text = link.textContent.trim();

        if (href === '#enquiry-modal' || text === 'Talk to a Specialist') {
            e.preventDefault();
            openModal();
        }
    });

    /* ---------- close triggers ---------- */
    closeBtn && closeBtn.addEventListener('click', closeModal);
    overlay  && overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    /* ---------- form submission (Web3Forms AJAX) ---------- */
    form && form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (success) success.hidden = true;
        if (error)   error.hidden   = true;

        // Basic validation
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
