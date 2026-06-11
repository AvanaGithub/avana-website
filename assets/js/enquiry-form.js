/* ============================================================
   AVANA — Homepage enquiry form (index.html)
   Web3Forms AJAX submission — no page redirect.

   Hardened version:
     - Diagnostic console.log lines at every key step so we can
       see exactly where things break in the browser dev tools.
     - Top-level try/catch around the IIFE body so any unexpected
       failure still leaves the user a clear error message.
     - Error message scrolls into view + briefly pulses so users
       notice when something went wrong (the previous version
       silently flipped a hidden <p> that no one would see).
   ============================================================ */

(function () {
    'use strict';

    try {
        console.log('[enquiry] script loaded');

        const form    = document.getElementById('enquiry-form');
        const submit  = document.getElementById('enquiry-submit');
        const success = document.getElementById('enquiry-success');
        const error   = document.getElementById('enquiry-error');

        if (!form) {
            console.warn('[enquiry] #enquiry-form not found on this page — handler will not bind');
            return;
        }
        console.log('[enquiry] handler bound to #enquiry-form');

        function showFeedback(el, type) {
            if (!el) return;
            el.style.display = 'block';
            // Pulse the colour/scale briefly so it's hard to miss.
            el.style.transition = 'transform 0.25s';
            el.style.transform = 'scale(1.06)';
            setTimeout(() => { el.style.transform = 'scale(1)'; }, 250);
            // Scroll into view in case user is still looking at the button.
            try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
            console.log('[enquiry] showing ' + type);
        }

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            console.log('[enquiry] submit clicked');

            if (success) success.style.display = 'none';
            if (error)   error.style.display   = 'none';

            if (!form.checkValidity()) {
                console.log('[enquiry] form invalid — calling reportValidity()');
                form.reportValidity();
                // Belt-and-suspenders: focus the first invalid field so the
                // user has somewhere to look even if the browser bubble misses.
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            if (submit) {
                submit.disabled = true;
                submit.textContent = 'Sending…';
            }

            try {
                const payload = Object.fromEntries(new FormData(form));
                console.log('[enquiry] POST payload', payload);

                const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                console.log('[enquiry] response status', res.status);

                const json = await res.json();
                console.log('[enquiry] response body', json);

                if (json && json.success) {
                    form.reset();
                    showFeedback(success, 'success');
                } else {
                    console.warn('[enquiry] Web3Forms returned non-success', json);
                    showFeedback(error, 'error (server)');
                }
            } catch (err) {
                console.error('[enquiry] fetch threw', err);
                showFeedback(error, 'error (network)');
            } finally {
                if (submit) {
                    submit.disabled = false;
                    submit.textContent = 'Submit Enquiry';
                }
            }
        });
    } catch (bootErr) {
        // Anything during script init goes here. Logged so the user can
        // paste the console output if the form still misbehaves.
        console.error('[enquiry] script init failed', bootErr);
    }
})();
