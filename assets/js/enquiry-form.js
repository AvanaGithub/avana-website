/* ============================================================
   AVANA — Homepage enquiry form (index.html)
   Web3Forms AJAX submission — no page redirect.
   ============================================================ */

(function () {
    'use strict';

    const form    = document.getElementById('enquiry-form');
    const submit  = document.getElementById('enquiry-submit');
    const success = document.getElementById('enquiry-success');
    const error   = document.getElementById('enquiry-error');

    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (success) success.style.display = 'none';
        if (error)   error.style.display   = 'none';

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
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            });
            const json = await res.json();

            if (json.success) {
                form.reset();
                if (success) success.style.display = 'block';
            } else {
                if (error) error.style.display = 'block';
            }
        } catch (_) {
            if (error) error.style.display = 'block';
        } finally {
            if (submit) {
                submit.disabled = false;
                submit.textContent = 'Submit Enquiry';
            }
        }
    });
})();
