/* ============================================================
   AVANA — Testimonials page loader
   Aggregates testimonials from every page JSON (pain-areas,
   audiences, conditions), deduplicates them by (name + first 60
   chars of quote), and renders them in two grids:
     - Patients   (everything except the surgeon audience)
     - Surgeons   (only the surgeon audience JSON)

   Why aggregate vs. a separate testimonials.json file?
     - Single source of truth: testimonials live with the page
       they support. Admin panel updates auto-flow here.
     - Adding a new testimonial to (say) knee.json automatically
       surfaces it on /testimonials with no extra step.
   ============================================================ */

(function () {
    'use strict';

    // -------------------------------------------------------------
    // Source list.
    // Patients: the same curated /testimonials.json the homepage
    // uses, so cards match the homepage design exactly (avatar +
    // productImage → 2-col layout with product tile).
    // Surgeons: audience-page JSON, filed under the Surgeon grid.
    // -------------------------------------------------------------
    const SOURCES = [
        { url: '/testimonials.json', root: 'array' },
        { url: '/data/audiences/surgeon.json', audience: 'surgeon' },
    ];

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // Same person often has slightly different quote text across the
    // page JSONs (page-specific marketing variants of one real story).
    // Dedupe on (name + product) so we render ONE card per
    // person-per-product. First occurrence in SOURCES order wins.
    function dedupKey(t) {
        const name = (t.name || '').trim().toLowerCase();
        const product = (t.product || '').trim().toLowerCase();
        return name + '|' + product;
    }

    /* Canonical testimonial card (matches homepage carousel).
       Kept in sync with pain-loader.js / solution-loader.js.
       Grid on this page → cards render as tiles; when a tile has no
       productImage the inner collapses to a single content column. */
    function renderCard(t) {
        const quote = t.testimonial || t.quote || '';
        const badges = [
            t.category ? `<span class="testimonial-card__badge testimonial-card__badge--category">${escapeHtml(t.category)}</span>` : '',
            t.product  ? `<span class="testimonial-card__badge testimonial-card__badge--product">${escapeHtml(t.product)}</span>`   : '',
            (!t.category && t.location) ? `<span class="testimonial-card__badge testimonial-card__badge--location">${escapeHtml(t.location)}</span>` : ''
        ].filter(Boolean).join('');
        const initial = (t.name || '?').trim().charAt(0).toUpperCase();
        const avatarSrc = t.avatar || t.photo;
        const avatarHtml = avatarSrc
            ? `<img class="testimonial-card__avatar" src="${escapeHtml(avatarSrc)}" alt="${escapeHtml(t.name || '')}" loading="lazy">`
            : `<span class="testimonial-card__avatar testimonial-card__avatar--fallback" aria-hidden="true">${escapeHtml(initial)}</span>`;
        const productHtml = t.productImage
            ? `<div class="testimonial-card__product"><img src="${escapeHtml(t.productImage)}" alt="${escapeHtml(t.product || 'Product')}" loading="lazy"></div>`
            : '';
        const innerClass = productHtml
            ? 'testimonial-card__inner'
            : 'testimonial-card__inner testimonial-card__inner--single-col';
        const meta = [t.location, t.product ? `${escapeHtml(t.product)} User` : '']
            .filter(Boolean).map(escapeHtml).join(' · ');
        return `
            <article class="testimonial-card" role="group" aria-roledescription="testimonial">
                <div class="${innerClass}">
                    <div class="testimonial-card__quote-mark" aria-hidden="true">&ldquo;&ldquo;</div>
                    <div class="testimonial-card__body">
                        ${badges ? `<div class="testimonial-card__badges">${badges}</div>` : ''}
                        <p class="testimonial-card__quote">${escapeHtml(quote)}</p>
                        <div class="testimonial-card__person">
                            ${avatarHtml}
                            <div class="testimonial-card__person-text">
                                <div class="testimonial-card__author">${escapeHtml(t.name || 'Anonymous')}</div>
                                ${meta ? `<div class="testimonial-card__role">${meta}</div>` : ''}
                            </div>
                        </div>
                    </div>
                    ${productHtml}
                </div>
            </article>`;
    }

    function paintGrid(gridId, loadingId, emptyId, items) {
        const grid    = document.getElementById(gridId);
        const loading = document.getElementById(loadingId);
        const empty   = document.getElementById(emptyId);
        if (loading) loading.hidden = true;
        if (!items.length) {
            if (empty) empty.hidden = false;
            return;
        }
        grid.innerHTML = items.map(renderCard).join('');
        grid.hidden = false;
    }

    async function init() {
        // Only run on the testimonials page
        if (!document.getElementById('patients-grid') || !document.getElementById('surgeons-grid')) return;

        // file:// won't fetch
        if (window.location.protocol === 'file:') {
            ['patients-loading', 'surgeons-loading'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = 'Open this page via a local server (start-server.bat) to see testimonials.';
            });
            return;
        }

        const patientMap = new Map();   // dedupKey → testimonial
        const surgeonMap = new Map();

        // Fetch all sources in parallel; ignore individual failures
        await Promise.allSettled(SOURCES.map(async src => {
            try {
                const res = await fetch(src.url, { cache: 'no-cache' });
                if (!res.ok) return;
                const data = await res.json();
                const list = (src.root === 'array' && Array.isArray(data))
                    ? data
                    : (Array.isArray(data.testimonials) ? data.testimonials : []);
                const bucket = (src.audience === 'surgeon') ? surgeonMap : patientMap;
                list.forEach(t => {
                    if (!t || !t.testimonial) return;
                    const k = dedupKey(t);
                    if (!bucket.has(k)) bucket.set(k, t);
                });
            } catch (err) {
                console.warn('testimonials-loader: failed to load ' + src.url, err);
            }
        }));

        paintGrid('patients-grid', 'patients-loading', 'patients-empty', [...patientMap.values()]);
        paintGrid('surgeons-grid', 'surgeons-loading', 'surgeons-empty', [...surgeonMap.values()]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
