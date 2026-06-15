/* ============================================================
   Avana Freestyle OA — landing page script
   Form validation, lead submission, tracking events.
   Minimal vanilla JS, no dependencies.
   ============================================================ */

(function () {
    'use strict';

    /* =============================================================
       CONFIG — replace before going live (see README.md)
       ============================================================= */
    const CONFIG = {
        // Where the lead is POSTed. Leave empty string to test the page
        // without a backend — submissions log to console + show success.
        // Examples:
        //   "https://script.google.com/macros/s/AKfycb…/exec"     (Google Sheets web app)
        //   "https://hooks.zapier.com/hooks/catch/…"               (Zapier)
        //   "https://yourapi.avanasurgical.com/api/leads"          (your own backend)
        LEAD_ENDPOINT: "",

        // PDF the user receives. Drop the real file in this folder with this name.
        GUIDE_PDF_URL: "knee-care-guide.pdf",

        // Form source tag — useful when multiple ads point at this page.
        // Leave as-is unless you start splitting traffic by creative.
        FORM_SOURCE: "freestyle-oa-landing"
    };

    /* =============================================================
       Helpers
       ============================================================= */
    const $  = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    function setError(fieldName, message) {
        const errEl = $(`[data-error-for="${fieldName}"]`);
        const input = $(`[name="${fieldName}"]`);
        if (errEl) errEl.textContent = message || "";
        if (input) {
            input.closest('.field')?.classList.toggle('field--error', !!message);
            input.setAttribute('aria-invalid', message ? 'true' : 'false');
        }
    }

    function clearAllErrors() {
        $$('.field').forEach(f => f.classList.remove('field--error'));
        $$('.field__error').forEach(e => { e.textContent = ''; });
    }

    /* =============================================================
       Validation rules
       ============================================================= */
    function validate(values) {
        const errors = {};

        if (!values.name || values.name.trim().length < 2) {
            errors.name = "Please enter your name.";
        }

        // Indian 10-digit mobile, starts with 6-9
        const cleanMobile = (values.mobile || '').replace(/\s|-/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
            errors.mobile = "Please enter a valid 10-digit Indian mobile number.";
        } else {
            values.mobile = cleanMobile;
        }

        if (!values.city || values.city.trim().length < 2) {
            errors.city = "Please enter your city.";
        }

        if (!values.who_for) {
            errors.who_for = "Please select an option.";
        }

        return errors;
    }

    /* =============================================================
       Tracking — fires after a confirmed successful submission
       ============================================================= */
    function trackLead(values) {
        // Meta Pixel — standard Lead event
        try {
            if (typeof window.fbq === 'function') {
                window.fbq('track', 'Lead', {
                    content_name: 'Freestyle OA Guide',
                    content_category: values.who_for
                });
            }
        } catch (e) { /* silent */ }

        // GTM dataLayer push for any downstream tags
        try {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'lead_submit',
                lead_form_source: CONFIG.FORM_SOURCE,
                lead_who_for: values.who_for,
                lead_callback_requested: values.callback_requested === 'yes'
            });
        } catch (e) { /* silent */ }
    }

    /* =============================================================
       Trigger the guide download. Programmatic click on a hidden
       anchor — avoids leaving the success page.
       ============================================================= */
    function downloadGuide() {
        try {
            const a = document.createElement('a');
            a.href = CONFIG.GUIDE_PDF_URL;
            a.download = CONFIG.GUIDE_PDF_URL.split('/').pop();
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            // Fallback link in the success message still works.
            console.warn('[lead] auto-download failed; user can click the manual link.', e);
        }
    }

    /* =============================================================
       Show success / reset state
       ============================================================= */
    function showSuccessState() {
        const form    = $('#lead-form-el');
        const thanks  = $('#thanks-state');
        if (form)   form.hidden   = true;
        if (thanks) {
            thanks.hidden = false;
            thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /* =============================================================
       Submit
       ============================================================= */
    async function handleSubmit(e) {
        e.preventDefault();
        clearAllErrors();

        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        data.callback_requested = data.callback_requested ? 'yes' : 'no';

        const errors = validate(data);
        if (Object.keys(errors).length) {
            Object.entries(errors).forEach(([k, v]) => setError(k, v));
            const firstBadField = $(`[name="${Object.keys(errors)[0]}"]`);
            if (firstBadField) firstBadField.focus();
            return;
        }

        const submitBtn = $('#submit-btn');
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';
        }

        // Add metadata the CRM might want
        const payload = {
            ...data,
            source: CONFIG.FORM_SOURCE,
            submitted_at: new Date().toISOString(),
            page_url: window.location.href,
            referrer: document.referrer || ''
        };

        try {
            if (CONFIG.LEAD_ENDPOINT) {
                // Real submission
                const res = await fetch(CONFIG.LEAD_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                // Many simple endpoints (Google Apps Script, Zapier) respond opaque/CORS-lite.
                // We treat ANY 2xx as success; opaque/0 responses also count as fired-and-forgot.
                if (res.type !== 'opaque' && !res.ok) {
                    throw new Error('HTTP ' + res.status);
                }
            } else {
                // Test mode — no endpoint set. Log payload and continue.
                console.log('[lead] LEAD_ENDPOINT not configured. Test payload:', payload);
            }

            trackLead(data);
            downloadGuide();
            showSuccessState();
        } catch (err) {
            console.error('[lead] submission failed', err);
            // Inline error at the bottom of the form so user can retry.
            setError('mobile', '');
            const failureNote = document.createElement('p');
            failureNote.className = 'field__error';
            failureNote.style.textAlign = 'center';
            failureNote.style.marginTop = '12px';
            failureNote.textContent = "Something went wrong. Please try again or call us directly.";
            form.appendChild(failureNote);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    }

    /* =============================================================
       Init
       ============================================================= */
    function init() {
        const form = $('#lead-form-el');
        if (!form) return;
        form.addEventListener('submit', handleSubmit);

        // Live error-clearing as user types — keeps things friendly.
        $$('input, select', form).forEach(input => {
            input.addEventListener('input', () => setError(input.name, ''));
        });

        // Mobile field: strip non-digits as user types, cap at 10.
        const mobile = $('#mobile');
        if (mobile) {
            mobile.addEventListener('input', () => {
                const cleaned = mobile.value.replace(/\D/g, '').slice(0, 10);
                if (cleaned !== mobile.value) mobile.value = cleaned;
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
