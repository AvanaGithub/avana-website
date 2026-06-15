/* ============================================================
   Avana Endoscopic Spine — landing page script
   Form validation, optional MRI upload, lead submission, tracking.
   ============================================================ */

(function () {
    'use strict';

    /* =============================================================
       CONFIG — replace before going live (see README.md)
       ============================================================= */
    const CONFIG = {
        // Where the lead is POSTed. Empty string = test mode (logs to console).
        // For file upload support, the endpoint must accept multipart/form-data.
        // Without a file, payload is sent as JSON.
        // Compatible: a small Node/Express backend, formspree.io, Cloudinary
        // upload widget, or a custom DO endpoint.
        // NOT compatible with file uploads: Google Apps Script (text-only),
        // basic Zapier hooks. For those, set FORWARD_FILE = false to keep
        // the file selection local-only and tell the user to share via
        // WhatsApp after.
        LEAD_ENDPOINT: "",
        FORWARD_FILE:  true,

        // Max upload size in MB. Bigger files = slow uploads on 4G.
        MAX_FILE_MB: 15,

        // WhatsApp number for fallback / mid-call sharing. Use full
        // international format, no + or spaces. Example: 919876543210
        WHATSAPP_NUMBER: "",

        // Form source tag — useful when multiple ads point at this page.
        FORM_SOURCE: "endoscopic-spine-landing"
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
    function validate(values, fileInput) {
        const errors = {};

        if (!values.name || values.name.trim().length < 2) {
            errors.name = "Please enter your name.";
        }

        const cleanMobile = (values.mobile || '').replace(/\s|-/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
            errors.mobile = "Please enter a valid 10-digit Indian mobile number.";
        } else {
            values.mobile = cleanMobile;
        }

        if (!values.city || values.city.trim().length < 2) {
            errors.city = "Please enter your city.";
        }

        if (!values.symptom) {
            errors.symptom = "Please choose your main symptom.";
        }

        if (!values.consent) {
            errors.consent = "Please confirm you agree to be contacted.";
        }

        // Optional file — only checked if user uploaded one
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const f = fileInput.files[0];
            const sizeMB = f.size / (1024 * 1024);
            if (sizeMB > CONFIG.MAX_FILE_MB) {
                errors.mri = `File too large (${sizeMB.toFixed(1)} MB). Max ${CONFIG.MAX_FILE_MB} MB. Please share via WhatsApp instead.`;
            }
        }

        return errors;
    }

    /* =============================================================
       Tracking — fires after a confirmed successful submission
       ============================================================= */
    function trackLead(values) {
        try {
            if (typeof window.fbq === 'function') {
                window.fbq('track', 'Lead', {
                    content_name: 'Endoscopic Spine Consultation',
                    content_category: values.symptom
                });
            }
        } catch (e) {}

        try {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'lead_submit',
                lead_form_source: CONFIG.FORM_SOURCE,
                lead_symptom: values.symptom,
                lead_has_mri: values.has_mri_upload === 'yes'
            });
        } catch (e) {}
    }

    /* =============================================================
       Success state
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

    function wireWhatsAppLink() {
        const el = $('#whatsapp-link');
        if (!el) return;
        if (CONFIG.WHATSAPP_NUMBER) {
            el.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I just booked a consultation through the endoscopic spine page.')}`;
            el.textContent = '+' + CONFIG.WHATSAPP_NUMBER;
        }
    }

    /* =============================================================
       Submit
       ============================================================= */
    async function handleSubmit(e) {
        e.preventDefault();
        clearAllErrors();

        const form = e.currentTarget;
        const fileInput = $('#mri');

        // Pull text values into a plain object for validation
        const fd = new FormData(form);
        const data = {
            name:    (fd.get('name')    || '').toString().trim(),
            mobile:  (fd.get('mobile')  || '').toString().trim(),
            city:    (fd.get('city')    || '').toString().trim(),
            symptom: (fd.get('symptom') || '').toString().trim(),
            consent: fd.get('consent') ? 'yes' : '',
            has_mri_upload: (fileInput && fileInput.files && fileInput.files[0]) ? 'yes' : 'no'
        };

        const errors = validate(data, fileInput);
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

        // Metadata the CRM may want
        const meta = {
            source:       CONFIG.FORM_SOURCE,
            submitted_at: new Date().toISOString(),
            page_url:     window.location.href,
            referrer:     document.referrer || ''
        };

        try {
            if (CONFIG.LEAD_ENDPOINT) {
                const hasFile = fileInput && fileInput.files && fileInput.files[0] && CONFIG.FORWARD_FILE;

                if (hasFile) {
                    // Multipart submission — preserves the file binary
                    const upload = new FormData();
                    Object.entries(data).forEach(([k, v]) => upload.append(k, v));
                    Object.entries(meta).forEach(([k, v]) => upload.append(k, v));
                    upload.append('mri', fileInput.files[0], fileInput.files[0].name);

                    const res = await fetch(CONFIG.LEAD_ENDPOINT, { method: 'POST', body: upload });
                    if (res.type !== 'opaque' && !res.ok) throw new Error('HTTP ' + res.status);
                } else {
                    // JSON submission — works with simple webhooks
                    const res = await fetch(CONFIG.LEAD_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...data, ...meta })
                    });
                    if (res.type !== 'opaque' && !res.ok) throw new Error('HTTP ' + res.status);
                }
            } else {
                console.log('[lead] LEAD_ENDPOINT not configured. Test payload:', { ...data, ...meta, mri_filename: fileInput?.files?.[0]?.name || null });
            }

            trackLead(data);
            showSuccessState();
        } catch (err) {
            console.error('[lead] submission failed', err);
            const failureNote = document.createElement('p');
            failureNote.className = 'field__error';
            failureNote.style.textAlign = 'center';
            failureNote.style.marginTop = '12px';
            failureNote.textContent = "Something went wrong. Please try again or message us directly on WhatsApp.";
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
        wireWhatsAppLink();

        const form = $('#lead-form-el');
        if (!form) return;
        form.addEventListener('submit', handleSubmit);

        // Live error clearing as the user types
        $$('input, select', form).forEach(input => {
            input.addEventListener('input',  () => setError(input.name, ''));
            input.addEventListener('change', () => setError(input.name, ''));
        });

        // Mobile field: strip non-digits as user types, cap at 10
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
