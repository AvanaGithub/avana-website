/* ============================================================
   AVANA SURGICAL — UNIFIED SOLUTION-TEMPLATE LOADER

   One template (solution-template.html) serves three URL families:

     /solutions/{slug}    → type: painArea     → data/pain-areas/{slug}.json
     /audiences/{slug}    → type: audience     → data/audiences/{slug}.json
     /conditions/{slug}   → type: condition    → data/conditions/{slug}.json

   Products are derived from data/products.json by filtering on
   relatedPainAreas / relatedAudiences / relatedConditions.
   This means a single product can appear in any combination of
   categories with zero data duplication.

   Backward-compat: query strings still work for local previews:
     solution-template.html?type=painArea&slug=knee
     pain.html?area=knee   (legacy redirect to /solutions/knee)
   ============================================================ */

(function () {
    'use strict';

    /* ----------------------------------------------------------
       1. TYPE REGISTRY
       Map URL prefix → page-data folder + product-relation key.
       To add a new browse mode in future, register it here.
       ---------------------------------------------------------- */
    const TYPES = {
        painArea: {
            urlPrefix: '/solutions/',
            dataFolder: 'data/pain-areas',
            relationKey: 'relatedPainAreas',
            validSlugs: ['knee', 'spine', 'shoulder', 'elbow', 'foot', 'hip'],
            defaultSlug: 'knee'
        },
        audience: {
            urlPrefix: '/audiences/',
            dataFolder: 'data/audiences',
            relationKey: 'relatedAudiences',
            validSlugs: ['seniors', 'back-pain', 'recovering-from-surgery', 'surgeon'],
            defaultSlug: 'seniors',
            // Legacy slugs that should silently 301-style redirect to a
            // new canonical slug. Used by resolveRoute() to keep any
            // existing inbound links working after a rename.
            slugAliases: { 'knee-joint-pain': 'seniors' }
        },
        condition: {
            urlPrefix: '/conditions/',
            dataFolder: 'data/conditions',
            relationKey: 'relatedConditions',
            validSlugs: ['osteoarthritis', 'post-surgery-recovery', 'cold-therapy', 'spine-support'],
            defaultSlug: 'osteoarthritis'
        }
    };

    /* ----------------------------------------------------------
       2. ROUTE RESOLUTION
       Inspect the URL — pathname first, then query string fallback.
       Returns { type, slug, config } or null if unresolvable.
       ---------------------------------------------------------- */
    function resolveRoute() {
        const pathname = window.location.pathname;
        const params = new URLSearchParams(window.location.search);

        // Helper: if the slug is a legacy/aliased name, return its
        // canonical replacement (e.g. knee-joint-pain → seniors).
        // Otherwise return the slug unchanged.
        function applyAlias(cfg, slug) {
            return (cfg.slugAliases && cfg.slugAliases[slug]) || slug;
        }

        // Path-based routing (production, via nginx rewrite)
        for (const [typeKey, cfg] of Object.entries(TYPES)) {
            if (pathname.startsWith(cfg.urlPrefix)) {
                const rest = pathname.slice(cfg.urlPrefix.length).replace(/\/+$/, '');
                const rawSlug = rest.split('/')[0];
                const slug = applyAlias(cfg, rawSlug);
                if (cfg.validSlugs.includes(slug)) {
                    return { type: typeKey, slug, config: cfg };
                }
                // Path matched but slug unknown — still return so we can show a 404
                return { type: typeKey, slug: rawSlug, config: cfg, notFound: true };
            }
        }

        // Query-string fallback (local preview / legacy compat)
        // Supported: ?type=painArea&slug=knee   OR   ?area=knee   OR   ?audience=back-pain   OR   ?condition=osteoarthritis
        const typeParam = params.get('type');
        if (typeParam && TYPES[typeParam]) {
            const raw = (params.get('slug') || TYPES[typeParam].defaultSlug).toLowerCase().trim();
            const slug = applyAlias(TYPES[typeParam], raw);
            return { type: typeParam, slug, config: TYPES[typeParam] };
        }
        if (params.get('area')) {
            const slug = params.get('area').toLowerCase().trim();
            return { type: 'painArea', slug, config: TYPES.painArea };
        }
        if (params.get('audience')) {
            const raw = params.get('audience').toLowerCase().trim();
            const slug = applyAlias(TYPES.audience, raw);
            return { type: 'audience', slug, config: TYPES.audience };
        }
        if (params.get('condition')) {
            const slug = params.get('condition').toLowerCase().trim();
            return { type: 'condition', slug, config: TYPES.condition };
        }

        // Default fallback — a knee solutions page
        return { type: 'painArea', slug: TYPES.painArea.defaultSlug, config: TYPES.painArea };
    }

    /* ----------------------------------------------------------
       3. SAFE HTML HELPERS
       ---------------------------------------------------------- */
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Allow LIMITED markup in long-form SEO content (paragraphs, headings, lists).
    // Strips <script>, on* attributes, javascript: URLs.
    function sanitizeRichHtml(html) {
        if (!html) return '';
        return String(html)
            .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
            .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
            .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
            .replace(/javascript:/gi, '');
    }

    function getPath(obj, path) {
        return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
    }

    /* ----------------------------------------------------------
       4. PRODUCT RESOLUTION
       Filter the catalog by the relation key for the current type.
       ---------------------------------------------------------- */
    function resolveProducts(catalog, route) {
        const relationKey = route.config.relationKey;
        const slug = route.slug;
        return (catalog.products || []).filter(p => {
            const rels = p[relationKey];
            return Array.isArray(rels) && rels.includes(slug);
        });
    }

    /* ----------------------------------------------------------
       5. DATA BINDINGS (textContent, attrs, page title)
       ---------------------------------------------------------- */
    function applyBindings(data) {
        document.title = data.metaTitle || document.title;

        document.querySelectorAll('[data-bind]').forEach(el => {
            const value = getPath(data, el.dataset.bind);
            if (value == null) return;
            if (el.tagName === 'META') {
                el.setAttribute('content', value);
            } else if (el.tagName === 'LINK') {
                el.setAttribute('href', value);
            } else {
                el.textContent = value;
            }
        });

        document.querySelectorAll('[data-bind-attr]').forEach(el => {
            el.dataset.bindAttr.split(',').forEach(pair => {
                const [attr, path] = pair.split(':').map(s => s.trim());
                const value = getPath(data, path);
                if (value != null) el.setAttribute(attr, value);
            });
        });

        const canonical = document.querySelector('link[data-bind="canonical"]');
        if (canonical) canonical.setAttribute('href', window.location.href);
    }

    /* ----------------------------------------------------------
       6. RENDERERS — keyed by data-render attribute
       ---------------------------------------------------------- */

    // Hide the parent <section data-section="…"> when a renderer has no
    // data. Used by every optional section so pages that don't carry
    // the new fields render exactly as before (no empty headers).
    function hideParentSection(mount) {
        const section = mount.closest('[data-section]');
        if (section) section.style.display = 'none';
    }

    // ===== TRAINING PROGRAM HELPERS =====

    // ISO date for "today" — used to split programs into past/upcoming.
    function todayIso() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    // "2026-04-15" → "15 Apr 2026"
    function formatProgramDate(iso) {
        if (!iso) return '';
        const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const parts = iso.split('-');
        if (parts.length !== 3) return iso;
        return `${parseInt(parts[2], 10)} ${m[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
    }

    // Build the date string shown on the card (handles multi-day ranges)
    function formatProgramDateRange(p) {
        const start = formatProgramDate(p.date);
        if (!p.endDate || p.endDate === p.date) return start;
        return `${start} → ${formatProgramDate(p.endDate)}`;
    }

    // Look up an activity label from its slug using the controlled vocab.
    function activityLabel(slug, vocab) {
        const match = (vocab || []).find(v => v.slug === slug);
        return match ? match.label : slug;
    }

    // Build the array of photo paths for a program. Generates
    // {folder}/01.jpg … NN.jpg based on photoCount. The live page
    // renders each <img> with onerror=hide so any number that's
    // missing on disk silently disappears.
    function programPhotoPaths(p) {
        const count = parseInt(p.photoCount, 10) || 0;
        if (count <= 0 || !p.photoFolder) return [];
        const folder = p.photoFolder.replace(/\/$/, '');
        const paths = [];
        for (let i = 1; i <= count; i++) {
            paths.push(`${folder}/${String(i).padStart(2, '0')}.jpg`);
        }
        return paths;
    }

    // Render one program card as an HTML string. isPast=true shows the
    // photo grid; isPast=false shows the registration CTA.
    function renderProgramCard(p, vocab, isPast) {
        const dateStr = formatProgramDateRange(p);
        const doctors = (p.doctors || []).join(', ');
        const acts = (p.activities || []).map(slug =>
            `<span class="training-card__activity">${escapeHtml(activityLabel(slug, vocab))}</span>`
        ).join('');
        const photos = programPhotoPaths(p);

        // Photo grid: show up to 3 thumbnails; if there are more, the
        // 3rd gets a "+N" overlay. All thumbnails open the lightbox.
        let photoGrid = '';
        if (isPast && photos.length) {
            const showCount = Math.min(photos.length, 3);
            const extra = photos.length - showCount;
            photoGrid = `<div class="training-card__photos" data-program-slug="${escapeAttr(p.slug)}">`;
            for (let i = 0; i < showCount; i++) {
                const isLastWithMore = (i === showCount - 1) && extra > 0;
                photoGrid += `<button type="button" class="training-card__photo${isLastWithMore ? ' training-card__photo--more' : ''}"${isLastWithMore ? ` data-extra="${extra}"` : ''} data-photo-idx="${i}" aria-label="Open photo ${i + 1}">`;
                photoGrid += `<img src="${escapeHtml(photos[i])}" alt="${escapeHtml(p.name)} photo ${i + 1}" loading="lazy" onerror="this.parentElement.style.display='none'">`;
                photoGrid += `</button>`;
            }
            photoGrid += `</div>`;
        }

        // CTA button: past programs link to mailto for enquiries; upcoming
        // get the registrationUrl if present, mailto fallback otherwise.
        let cta;
        if (isPast) {
            cta = `<a href="mailto:info@avanasurgical.com?subject=${encodeURIComponent('Enquiry: ' + p.name)}" class="training-card__cta">Ask about this programme</a>`;
        } else {
            const regUrl = p.registrationUrl || `mailto:info@avanasurgical.com?subject=${encodeURIComponent('Registration: ' + p.name)}`;
            cta = `<a href="${escapeHtml(regUrl)}" class="training-card__cta"${/^https?:/i.test(regUrl) ? ' target="_blank" rel="noopener"' : ''}>Register / Enquire</a>`;
        }

        // Hidden full-photo list embedded in the card so the lightbox
        // can read it cleanly without re-fetching anything.
        const photoData = photos.length
            ? `<script type="application/json" class="training-card__photo-data">${JSON.stringify({ slug: p.slug, name: p.name, photos })}</script>`
            : '';

        return `
            <article class="training-card" data-program-slug="${escapeAttr(p.slug)}">
                <div class="training-card__date">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    ${escapeHtml(dateStr)}
                </div>
                <h3 class="training-card__title">${escapeHtml(p.name)}</h3>
                <div class="training-card__meta">
                    ${doctors ? `<div class="training-card__meta-row"><span class="training-card__meta-label">Faculty</span><span>${escapeHtml(doctors)}</span></div>` : ''}
                    ${p.place ? `<div class="training-card__meta-row"><span class="training-card__meta-label">Where</span><span>${escapeHtml(p.place)}${p.venue ? ' · ' + escapeHtml(p.venue) : ''}</span></div>` : ''}
                </div>
                ${acts ? `<div class="training-card__activities">${acts}</div>` : ''}
                ${p.description ? `<p class="training-card__description">${escapeHtml(p.description)}</p>` : ''}
                ${isPast && Array.isArray(p.highlights) && p.highlights.length ? `<ul class="training-card__highlights">${p.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>` : ''}
                ${photoGrid}
                ${cta}
                ${photoData}
            </article>
        `;
    }

    // Wire every .training-card__photo button in `mount` so it opens
    // the shared #lightbox starting at the clicked photo.
    function bindLightboxTriggers(mount) {
        const lb = document.getElementById('lightbox');
        if (!lb) return;
        const imgEl = lb.querySelector('#lightbox-img');
        const counterEl = lb.querySelector('#lightbox-counter');
        const closeBtn = lb.querySelector('#lightbox-close');
        const prevBtn = lb.querySelector('#lightbox-prev');
        const nextBtn = lb.querySelector('#lightbox-next');

        let currentPhotos = [];
        let currentIdx = 0;

        function show(idx) {
            currentIdx = (idx + currentPhotos.length) % currentPhotos.length;
            imgEl.src = currentPhotos[currentIdx];
            counterEl.textContent = `${currentIdx + 1} / ${currentPhotos.length}`;
        }
        function open(photos, idx) {
            currentPhotos = photos;
            show(idx);
            lb.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        function close() {
            lb.classList.remove('open');
            document.body.style.overflow = '';
        }

        mount.querySelectorAll('.training-card').forEach(card => {
            const dataEl = card.querySelector('.training-card__photo-data');
            if (!dataEl) return;
            let info;
            try { info = JSON.parse(dataEl.textContent); }
            catch { return; }
            card.querySelectorAll('.training-card__photo').forEach((btn, i) => {
                btn.addEventListener('click', () => open(info.photos, i));
            });
        });

        // These wire once per page load — guard so we don't double-bind
        // if the renderer runs twice for any reason.
        if (!lb.dataset.wired) {
            closeBtn.addEventListener('click', close);
            prevBtn.addEventListener('click', () => show(currentIdx - 1));
            nextBtn.addEventListener('click', () => show(currentIdx + 1));
            lb.addEventListener('click', e => { if (e.target === lb) close(); });
            document.addEventListener('keydown', e => {
                if (!lb.classList.contains('open')) return;
                if (e.key === 'Escape') close();
                else if (e.key === 'ArrowLeft') show(currentIdx - 1);
                else if (e.key === 'ArrowRight') show(currentIdx + 1);
            });
            lb.dataset.wired = '1';
        }
    }

    // Tiny attr-escape — alias to escapeHtml for safety inside attribute values.
    function escapeAttr(s) { return escapeHtml(s); }

    const renderers = {
        'hero.ctas': (mount, data) => {
            const ctas = data.hero?.ctas || [];
            mount.innerHTML = ctas.map(cta => {
                const cls = cta.style === 'outline' ? 'btn btn--outline'
                          : cta.style === 'secondary' ? 'btn btn--secondary'
                          : 'btn btn--primary';
                const target = cta.external ? ' target="_blank" rel="noopener"' : '';
                return `<a href="${escapeHtml(cta.href)}" class="${cls}"${target}>${escapeHtml(cta.label)}</a>`;
            }).join('');
        },

        'conditions': (mount, data) => {
            const items = data.conditions || [];
            if (!items.length) { hideParentSection(mount); return; }
            mount.innerHTML = items.map(c => `
                <article class="condition-card">
                    <div class="condition-card__icon">${escapeHtml(c.icon || '+')}</div>
                    <h3 class="condition-card__title">${escapeHtml(c.title)}</h3>
                    <p class="condition-card__description">${escapeHtml(c.description)}</p>
                </article>
            `).join('');
        },

        // ---- New section renderers (intro / whatIs / symptoms / causes / treatment / whenToSeeDoctor) ----

        // Single rich-HTML block (typically a <p class="lede">…</p>).
        // Strings only — sanitised, so <strong> + <a> survive but <script> is stripped.
        'intro': (mount, data) => {
            const html = typeof data.intro === 'string' ? data.intro : (data.intro && data.intro.html);
            if (!html || !String(html).trim()) { hideParentSection(mount); return; }
            mount.innerHTML = sanitizeRichHtml(html);
        },

        // Long-form "What is X" — array of paragraph strings.
        'whatIs': (mount, data) => {
            const w = data.whatIs;
            const paragraphs = (w && Array.isArray(w.paragraphs)) ? w.paragraphs : [];
            if (!paragraphs.length) { hideParentSection(mount); return; }
            mount.innerHTML = paragraphs.map(p => sanitizeRichHtml(p)).join('\n');
        },

        // Symptoms / Causes — both render a card-style <ul class="point-list">.
        // Items are HTML strings (so they can include <strong>); sanitised.
        'symptoms': (mount, data) => {
            const items = (data.symptoms && Array.isArray(data.symptoms.items)) ? data.symptoms.items : [];
            if (!items.length) { hideParentSection(mount); return; }
            mount.innerHTML = items.map(item => `<li>${sanitizeRichHtml(item)}</li>`).join('');
        },

        'causes': (mount, data) => {
            const items = (data.causes && Array.isArray(data.causes.items)) ? data.causes.items : [];
            if (!items.length) { hideParentSection(mount); return; }
            mount.innerHTML = items.map(item => `<li>${sanitizeRichHtml(item)}</li>`).join('');
        },

        // Treatment options — numbered ordered list, optionally followed by a closing paragraph.
        'treatment': (mount, data) => {
            const t = data.treatment;
            const steps = (t && Array.isArray(t.steps)) ? t.steps : [];
            if (!steps.length) { hideParentSection(mount); return; }
            let html = '<ol>' + steps.map(s => `<li>${sanitizeRichHtml(s)}</li>`).join('') + '</ol>';
            if (t.closing) html += sanitizeRichHtml(t.closing);
            mount.innerHTML = html;
        },

        // Red-flag list — same checkmark icon as symptoms / causes for visual
        // consistency. (We could use a warning glyph but it tested poorly.)
        // Optional .note element below the list is bound separately via data-bind
        // and hidden here when empty so we don't leave a styled empty block.
        'whenToSeeDoctor': (mount, data) => {
            const w = data.whenToSeeDoctor;
            const items = (w && Array.isArray(w.items)) ? w.items : [];
            if (!items.length) { hideParentSection(mount); return; }
            mount.innerHTML = items.map(item => `<li>${sanitizeRichHtml(item)}</li>`).join('');
            // Hide the note element if no note text on this page.
            const section = mount.closest('[data-section]');
            if (section) {
                const noteEl = section.querySelector('.when-to-see-doctor-note');
                if (noteEl && !w.note) noteEl.style.display = 'none';
            }
        },

        // Products are resolved from the global catalog, not from data.products.
        // Each card CTA goes directly to product.link (osteokart) — no detail page.
        // Long descriptions are clamped to a fixed line count for uniform card
        // heights, with a Read more toggle that expands in-place.
        'products': (mount, data, ctx) => {
            const items = ctx.products || [];
            if (!items.length) {
                mount.innerHTML = `<p class="product-grid__empty">No matching products yet — please check back soon or <a href="mailto:info@avanasurgical.com">talk to a specialist</a>.</p>`;
                return;
            }

            // Threshold (chars) above which we offer a Read more toggle.
            // Anything shorter fits in the default clamp without truncation.
            const READ_MORE_THRESHOLD = 95;

            mount.innerHTML = items.map(p => {
                const desc = p.shortDescription || '';
                const needsToggle = desc.length > READ_MORE_THRESHOLD;
                return `
                <article class="product-card">
                    <div class="product-card__image">
                        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">
                    </div>
                    <div class="product-card__body">
                        ${p.brand ? `<div class="product-card__brand">${escapeHtml(p.brand)}</div>` : ''}
                        <h3 class="product-card__title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
                        <p class="product-card__description${needsToggle ? ' product-card__description--clamped' : ''}">${escapeHtml(desc)}</p>
                        ${needsToggle ? `<button type="button" class="product-card__read-more" aria-expanded="false">Read more</button>` : ''}
                        ${p.usage ? `<div class="product-card__usage"><strong>Recommended for</strong>${escapeHtml(p.usage)}</div>` : ''}
                        <a href="${escapeHtml(p.link)}" class="product-card__cta" target="_blank" rel="noopener" data-product-slug="${escapeHtml(p.slug)}">
                            ${escapeHtml(p.ctaLabel || 'Buy Now')}
                        </a>
                    </div>
                </article>
            `;
            }).join('');

            // Wire Read more / Read less toggles.
            mount.querySelectorAll('.product-card__read-more').forEach(btn => {
                btn.addEventListener('click', () => {
                    const card = btn.closest('.product-card');
                    const desc = card.querySelector('.product-card__description');
                    const expanded = desc.classList.toggle('product-card__description--clamped');
                    // toggle returns true if class is now PRESENT (still clamped),
                    // so the expanded state is the opposite.
                    const isExpanded = !expanded;
                    btn.textContent = isExpanded ? 'Read less' : 'Read more';
                    btn.setAttribute('aria-expanded', String(isExpanded));
                });
            });

            // Click tracking — Google Analytics if present
            mount.querySelectorAll('.product-card__cta').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.gtag) {
                        window.gtag('event', 'product_click', {
                            product_slug: link.dataset.productSlug,
                            browse_type: ctx.route.type,
                            browse_slug: ctx.route.slug,
                            destination: 'osteokart'
                        });
                    }
                });
            });
        },

        // ===== TRAINING PROGRAMS =====
        // Both renderers split ctx.trainingPrograms by today's date and
        // render their respective half. If the page isn't the surgeon
        // page, ctx.trainingPrograms is empty so both sections hide.
        'upcomingPrograms': (mount, data, ctx) => {
            const all = (ctx && ctx.trainingPrograms) || [];
            const today = todayIso();
            const upcoming = all
                .filter(p => p.date >= today)
                .sort((a, b) => a.date.localeCompare(b.date)); // earliest first
            if (!upcoming.length) { hideParentSection(mount); return; }
            const vocab = (data._activityVocab) || [];
            mount.innerHTML = upcoming.map(p => renderProgramCard(p, vocab, /* isPast */ false)).join('');
        },

        'pastPrograms': (mount, data, ctx) => {
            const all = (ctx && ctx.trainingPrograms) || [];
            const today = todayIso();
            const past = all
                .filter(p => p.date < today)
                .sort((a, b) => b.date.localeCompare(a.date)); // newest first
            if (!past.length) { hideParentSection(mount); return; }
            const vocab = (data._activityVocab) || [];
            mount.innerHTML = past.map(p => renderProgramCard(p, vocab, /* isPast */ true)).join('');
            // Wire photo thumbnails to the shared lightbox.
            bindLightboxTriggers(mount);
        },

        'testimonials': (mount, data) => {
            const items = data.testimonials || [];
            const track = mount.querySelector('.testimonial-carousel__track');
            const dotsWrap = mount.querySelector('.testimonial-carousel__dots');
            if (!items.length) {
                mount.style.display = 'none';
                return;
            }

            // Quotes longer than this get a Read more toggle; shorter quotes
            // fit cleanly within the default clamp + reserved min-height.
            const QUOTE_READ_MORE_THRESHOLD = 180;

            track.innerHTML = items.map((t, i) => {
                const quote = t.testimonial || '';
                const needsToggle = quote.length > QUOTE_READ_MORE_THRESHOLD;
                return `
                <div class="testimonial-card" role="tabpanel" aria-hidden="${i === 0 ? 'false' : 'true'}">
                    <div class="testimonial-card__inner">
                        <div class="testimonial-card__mark">"</div>
                        <p class="testimonial-card__quote${needsToggle ? ' testimonial-card__quote--clamped' : ''}">${escapeHtml(quote)}</p>
                        ${needsToggle ? `<button type="button" class="testimonial-card__read-more" aria-expanded="false">Read more</button>` : ''}
                        <div class="testimonial-card__badges">
                            ${t.product ? `<span class="testimonial-card__badge testimonial-card__badge--product">${escapeHtml(t.product)}</span>` : ''}
                            ${t.location ? `<span class="testimonial-card__badge testimonial-card__badge--location">${escapeHtml(t.location)}</span>` : ''}
                        </div>
                        <div class="testimonial-card__author">— ${escapeHtml(t.name)}</div>
                    </div>
                </div>
            `;
            }).join('');

            // Wire Read more / Read less. Stop propagation so the click
            // doesn't interfere with carousel touch/swipe handlers.
            track.querySelectorAll('.testimonial-card__read-more').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const quote = btn.parentElement.querySelector('.testimonial-card__quote');
                    const stillClamped = quote.classList.toggle('testimonial-card__quote--clamped');
                    const isExpanded = !stillClamped;
                    btn.textContent = isExpanded ? 'Read less' : 'Read more';
                    btn.setAttribute('aria-expanded', String(isExpanded));
                });
            });

            dotsWrap.innerHTML = items.map((_, i) => `
                <button class="testimonial-carousel__dot${i === 0 ? ' testimonial-carousel__dot--active' : ''}" data-idx="${i}" role="tab" aria-label="Go to testimonial ${i + 1}"></button>
            `).join('');
            initCarousel(mount, items.length);
        },

        'seoContent': (mount, data) => {
            const seo = data.seoContent;
            if (!seo) { mount.style.display = 'none'; return; }
            let html = '';
            if (seo.title) html += `<h2 class="seo-article__title">${escapeHtml(seo.title)}</h2>`;
            if (seo.intro) html += `<p class="seo-article__intro">${escapeHtml(seo.intro)}</p>`;
            (seo.sections || []).forEach(s => {
                if (s.heading) html += `<h3>${escapeHtml(s.heading)}</h3>`;
                if (s.body) html += sanitizeRichHtml(s.body);
            });
            if (seo.disclaimer) html += `<div class="seo-article__disclaimer">${escapeHtml(seo.disclaimer)}</div>`;
            mount.innerHTML = html;
        },

        'faq': (mount, data) => {
            const items = data.faq || [];
            mount.innerHTML = items.map((f, i) => `
                <div class="faq-item" data-faq-idx="${i}">
                    <button class="faq-item__question" aria-expanded="false" aria-controls="faq-a-${i}">
                        <span>${escapeHtml(f.question)}</span>
                        <span class="faq-item__icon" aria-hidden="true">+</span>
                    </button>
                    <div class="faq-item__answer" id="faq-a-${i}" role="region">
                        <p>${escapeHtml(f.answer)}</p>
                    </div>
                </div>
            `).join('');
            mount.querySelectorAll('.faq-item').forEach(item => {
                const btn = item.querySelector('.faq-item__question');
                btn.addEventListener('click', () => {
                    const isOpen = item.classList.toggle('faq-item--open');
                    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                });
            });
            // FAQPage structured data for SEO
            const faqSchema = {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: items.map(f => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: { '@type': 'Answer', text: f.answer }
                }))
            };
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(faqSchema);
            document.head.appendChild(script);
        },

        'blog': (mount, data) => {
            const items = data.blog || [];
            const section = mount.closest('[data-section="blog"]');
            if (!items.length) {
                if (section) section.style.display = 'none';
                return;
            }
            mount.innerHTML = items.map(b => `
                <a href="${escapeHtml(b.url)}" class="blog-card" target="${b.external ? '_blank' : '_self'}" ${b.external ? 'rel="noopener"' : ''}>
                    <div class="blog-card__image"><img src="${escapeHtml(b.image)}" alt="${escapeHtml(b.title)}" loading="lazy"></div>
                    <div class="blog-card__body">
                        <div class="blog-card__meta">${escapeHtml(b.category || 'Article')} · ${escapeHtml(b.readTime || '4 min read')}</div>
                        <h3 class="blog-card__title">${escapeHtml(b.title)}</h3>
                        <p class="blog-card__excerpt">${escapeHtml(b.excerpt)}</p>
                    </div>
                </a>
            `).join('');
        },

        'brands': (mount, data) => {
            const items = data.brands || [];
            mount.innerHTML = items.map(b => `
                <div class="brand-strip__item">
                    <img class="brand-strip__logo" src="${escapeHtml(b.logo)}" alt="${escapeHtml(b.name)}" loading="lazy">
                    ${b.caption ? `<span class="brand-strip__caption">${escapeHtml(b.caption)}</span>` : ''}
                </div>
            `).join('');
        },

        'cta.buttons': (mount, data) => {
            const buttons = data.cta?.buttons || [];
            mount.innerHTML = buttons.map(btn => {
                const cls = (btn.style === 'outline' || btn.style === 'secondary') ? 'btn btn--secondary' : 'btn btn--primary';
                const target = btn.external ? ' target="_blank" rel="noopener"' : '';
                return `<a href="${escapeHtml(btn.href)}" class="${cls}"${target}>${escapeHtml(btn.label)}</a>`;
            }).join('');
        }
    };

    /* ----------------------------------------------------------
       7. TESTIMONIAL CAROUSEL
       ---------------------------------------------------------- */
    function initCarousel(mount, count) {
        if (count <= 1) {
            mount.querySelectorAll('.testimonial-carousel__arrow, .testimonial-carousel__dots').forEach(el => el.style.display = 'none');
            return;
        }
        const track = mount.querySelector('.testimonial-carousel__track');
        const dots = mount.querySelectorAll('.testimonial-carousel__dot');
        const prev = mount.querySelector('.testimonial-carousel__arrow--prev');
        const next = mount.querySelector('.testimonial-carousel__arrow--next');
        let idx = 0;
        let timer = null;

        const goto = (i) => {
            idx = (i + count) % count;
            track.style.transform = `translateX(-${idx * 100}%)`;
            dots.forEach((d, di) => d.classList.toggle('testimonial-carousel__dot--active', di === idx));
            track.querySelectorAll('.testimonial-card').forEach((c, ci) => c.setAttribute('aria-hidden', ci === idx ? 'false' : 'true'));
        };
        const start = () => { stop(); timer = setInterval(() => goto(idx + 1), 6000); };
        const stop = () => { if (timer) clearInterval(timer); };

        prev.addEventListener('click', () => { goto(idx - 1); start(); });
        next.addEventListener('click', () => { goto(idx + 1); start(); });
        dots.forEach(d => d.addEventListener('click', () => { goto(parseInt(d.dataset.idx, 10)); start(); }));
        mount.addEventListener('mouseenter', stop);
        mount.addEventListener('mouseleave', start);

        let startX = 0;
        track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stop(); }, { passive: true });
        track.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 50) goto(idx + (diff < 0 ? 1 : -1));
            start();
        });

        start();
    }

    /* ----------------------------------------------------------
       8. RUN ALL RENDERERS
       ---------------------------------------------------------- */
    function renderAll(data, ctx) {
        Object.keys(renderers).forEach(key => {
            const mount = document.querySelector(`[data-render="${key}"]`);
            if (mount) {
                try { renderers[key](mount, data, ctx); }
                catch (err) { console.error(`Renderer "${key}" failed:`, err); }
            }
        });
    }

    /* ----------------------------------------------------------
       9. ERROR / NOT-FOUND STATE
       ---------------------------------------------------------- */
    function showError(msg, hint) {
        const loading = document.getElementById('pain-loading');
        if (!loading) return;
        const isFileProtocol = window.location.protocol === 'file:';
        const hintHtml = isFileProtocol ? `
            <div style="max-width: 640px; margin: 0 auto 28px; padding: 20px 24px; background-color: rgba(177, 140, 87, 0.10); border-left: 3px solid #B18C57; border-radius: 8px; text-align: left;">
                <p style="margin: 0 0 10px; color: #1F1F1F; font-weight: 600;">Looks like you opened this file directly.</p>
                <p style="margin: 0 0 10px; color: #1F1F1F; font-size: 0.95rem; line-height: 1.7;">Browsers block <code>fetch()</code> on <code>file://</code> URLs. To preview locally:</p>
                <ol style="margin: 0 0 0 20px; color: #1F1F1F; font-size: 0.95rem; line-height: 1.8;">
                    <li>Double-click <strong>start-server.bat</strong> in the project folder, or run <code>python -m http.server 8000</code></li>
                    <li>Open <a href="http://localhost:8000/solution-template.html?type=painArea&slug=knee" style="color: #B18C57; font-weight: 600;">http://localhost:8000/solution-template.html?type=painArea&amp;slug=knee</a></li>
                </ol>
                <p style="margin: 12px 0 0; color: #6C6C6C; font-size: 0.85rem;">In production, the clean URL <code>/solutions/knee</code> is rewritten by nginx to this template.</p>
            </div>` : (hint ? `<p style="color: var(--color-muted); margin-bottom: 24px; font-size: 0.92rem;">${escapeHtml(hint)}</p>` : '');

        loading.innerHTML = `
            <div class="container" style="text-align:center; padding: 80px 0;">
                <h2 style="color: var(--color-primary); margin-bottom: 12px;">${isFileProtocol ? 'Preview server needed' : 'Page not found'}</h2>
                <p style="color: var(--color-muted); margin-bottom: 24px;">${escapeHtml(msg)}</p>
                ${hintHtml}
                <a href="/" class="btn btn--primary">Back to Home</a>
            </div>`;
    }

    /* ----------------------------------------------------------
       10. INIT
       ---------------------------------------------------------- */
    async function init() {
        if (window.location.protocol === 'file:') {
            showError('This page loads content dynamically and needs to run on a local web server.');
            return;
        }

        const route = resolveRoute();
        if (!route || route.notFound) {
            showError(`No content found for "${route ? route.slug : 'this URL'}".`);
            return;
        }

        const pageJsonUrl = `${route.config.dataFolder}/${route.slug}.json`;
        const catalogUrl = 'data/products.json';
        // Training programs only matter on the Surgeon audience page.
        // Anywhere else, we skip the fetch entirely to avoid an
        // unnecessary network call.
        const isSurgeonPage = route.type === 'audience' && route.slug === 'surgeon';
        const programsUrl = isSurgeonPage ? 'data/training-programs.json' : null;

        try {
            const fetches = [
                fetch(pageJsonUrl, { cache: 'no-cache' }),
                fetch(catalogUrl, { cache: 'no-cache' })
            ];
            if (programsUrl) fetches.push(fetch(programsUrl, { cache: 'no-cache' }));
            const responses = await Promise.all(fetches);
            const [pageRes, catalogRes, programsRes] = responses;
            if (!pageRes.ok) throw new Error(`Failed to load ${pageJsonUrl} (${pageRes.status})`);
            if (!catalogRes.ok) throw new Error(`Failed to load ${catalogUrl} (${catalogRes.status})`);

            const data = await pageRes.json();
            const catalog = await catalogRes.json();
            data.slug = data.slug || route.slug;

            // Training programs are optional — if the file is missing or
            // unparseable we just skip the upcoming/past sections rather
            // than failing the whole page.
            let trainingPrograms = [];
            if (programsRes && programsRes.ok) {
                try {
                    const tp = await programsRes.json();
                    trainingPrograms = Array.isArray(tp.programs) ? tp.programs : [];
                    if (tp.controlledVocab && tp.controlledVocab.activities) {
                        data._activityVocab = tp.controlledVocab.activities;
                    }
                } catch (e) {
                    console.warn('training-programs.json failed to parse — skipping training sections', e);
                }
            }

            const products = resolveProducts(catalog, route);
            const ctx = { route, products, catalog, trainingPrograms };

            applyBindings(data);
            renderAll(data, ctx);

            const loading = document.getElementById('pain-loading');
            const main = document.getElementById('pain-main');
            if (loading) loading.style.display = 'none';
            if (main) main.hidden = false;

            // Set a body class so per-type styling is possible
            document.body.classList.add(`solution-${route.type}`);

            if (window.location.hash) {
                setTimeout(() => {
                    const target = document.querySelector(window.location.hash);
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                }, 200);
            }
        } catch (err) {
            console.error(err);
            showError(`We couldn't load this page. (${err.message})`);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
