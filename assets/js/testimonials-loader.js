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
    // Source list. Every entry maps to data/{path}.json.
    // The "audience": "surgeon" marker tells us to file the
    // testimonial under the Surgeon grid instead of Patient.
    // -------------------------------------------------------------
    const SOURCES = [
        // Pain areas
        { url: 'data/pain-areas/knee.json' },
        { url: 'data/pain-areas/spine.json' },
        { url: 'data/pain-areas/shoulder.json' },
        { url: 'data/pain-areas/elbow.json' },
        { url: 'data/pain-areas/foot.json' },
        { url: 'data/pain-areas/hip.json' },
        // Audiences
        { url: 'data/audiences/seniors.json' },
        { url: 'data/audiences/back-pain.json' },
        { url: 'data/audiences/recovering-from-surgery.json' },
        { url: 'data/audiences/surgeon.json', audience: 'surgeon' },
        // Conditions
        { url: 'data/conditions/osteoarthritis.json' },
        { url: 'data/conditions/post-surgery-recovery.json' },
        { url: 'data/conditions/cold-therapy.json' },
        { url: 'data/conditions/spine-support.json' },
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

    function renderCard(t) {
        const badges = [];
        if (t.product)  badges.push(`<span class="tm-card__badge tm-card__badge--product">${escapeHtml(t.product)}</span>`);
        if (t.location) badges.push(`<span class="tm-card__badge tm-card__badge--location">${escapeHtml(t.location)}</span>`);
        return `
            <article class="tm-card">
                <div class="tm-card__mark">"</div>
                <p class="tm-card__quote">${escapeHtml(t.testimonial || '')}</p>
                ${badges.length ? `<div class="tm-card__badges">${badges.join('')}</div>` : ''}
                <div class="tm-card__author">${escapeHtml(t.name || 'Anonymous')}</div>
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
                const list = Array.isArray(data.testimonials) ? data.testimonials : [];
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
