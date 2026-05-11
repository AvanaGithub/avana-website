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
            validSlugs: ['knee-joint-pain', 'back-pain', 'recovering-from-surgery', 'surgeon'],
            defaultSlug: 'knee-joint-pain'
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

        // Path-based routing (production, via nginx rewrite)
        for (const [typeKey, cfg] of Object.entries(TYPES)) {
            if (pathname.startsWith(cfg.urlPrefix)) {
                const rest = pathname.slice(cfg.urlPrefix.length).replace(/\/+$/, '');
                const slug = rest.split('/')[0];
                if (cfg.validSlugs.includes(slug)) {
                    return { type: typeKey, slug, config: cfg };
                }
                // Path matched but slug unknown — still return so we can show a 404
                return { type: typeKey, slug, config: cfg, notFound: true };
            }
        }

        // Query-string fallback (local preview / legacy compat)
        // Supported: ?type=painArea&slug=knee   OR   ?area=knee   OR   ?audience=back-pain   OR   ?condition=osteoarthritis
        const typeParam = params.get('type');
        if (typeParam && TYPES[typeParam]) {
            const slug = (params.get('slug') || TYPES[typeParam].defaultSlug).toLowerCase().trim();
            return { type: typeParam, slug, config: TYPES[typeParam] };
        }
        if (params.get('area')) {
            const slug = params.get('area').toLowerCase().trim();
            return { type: 'painArea', slug, config: TYPES.painArea };
        }
        if (params.get('audience')) {
            const slug = params.get('audience').toLowerCase().trim();
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
            mount.innerHTML = items.map(c => `
                <article class="condition-card">
                    <div class="condition-card__icon">${escapeHtml(c.icon || '+')}</div>
                    <h3 class="condition-card__title">${escapeHtml(c.title)}</h3>
                    <p class="condition-card__description">${escapeHtml(c.description)}</p>
                </article>
            `).join('');
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
                            ${escapeHtml(p.ctaLabel || 'View on Osteokart')}
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

        'testimonials': (mount, data) => {
            const items = data.testimonials || [];
            const track = mount.querySelector('.testimonial-carousel__track');
            const dotsWrap = mount.querySelector('.testimonial-carousel__dots');
            if (!items.length) {
                mount.style.display = 'none';
                return;
            }
            track.innerHTML = items.map((t, i) => `
                <div class="testimonial-card" role="tabpanel" aria-hidden="${i === 0 ? 'false' : 'true'}">
                    <div class="testimonial-card__inner">
                        <div class="testimonial-card__mark">"</div>
                        <p class="testimonial-card__quote">${escapeHtml(t.testimonial)}</p>
                        <div class="testimonial-card__badges">
                            ${t.product ? `<span class="testimonial-card__badge testimonial-card__badge--product">${escapeHtml(t.product)}</span>` : ''}
                            ${t.location ? `<span class="testimonial-card__badge testimonial-card__badge--location">${escapeHtml(t.location)}</span>` : ''}
                        </div>
                        <div class="testimonial-card__author">— ${escapeHtml(t.name)}</div>
                    </div>
                </div>
            `).join('');
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

        try {
            const [pageRes, catalogRes] = await Promise.all([
                fetch(pageJsonUrl, { cache: 'no-cache' }),
                fetch(catalogUrl, { cache: 'no-cache' })
            ]);
            if (!pageRes.ok) throw new Error(`Failed to load ${pageJsonUrl} (${pageRes.status})`);
            if (!catalogRes.ok) throw new Error(`Failed to load ${catalogUrl} (${catalogRes.status})`);

            const data = await pageRes.json();
            const catalog = await catalogRes.json();
            data.slug = data.slug || route.slug;

            const products = resolveProducts(catalog, route);
            const ctx = { route, products, catalog };

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
