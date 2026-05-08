/* ============================================================
   AVANA SURGICAL — PAIN PAGE DYNAMIC LOADER
   Reads ?area={slug} from URL, fetches data/{slug}.json,
   renders all sections into the shared template.
   ============================================================ */

(function () {
    'use strict';

    const VALID_SLUGS = ['knee', 'spine', 'shoulder', 'elbow', 'foot', 'hip'];
    const DEFAULT_SLUG = 'knee';

    // -------- 1. RESOLVE SLUG --------
    function getSlug() {
        const params = new URLSearchParams(window.location.search);
        const raw = (params.get('area') || DEFAULT_SLUG).toLowerCase().trim();
        return VALID_SLUGS.includes(raw) ? raw : DEFAULT_SLUG;
    }

    // -------- 2. SAFE HTML ESCAPE --------
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Allow LIMITED markup in long-form SEO content (paragraphs, headings, lists)
    // Strips <script>, on* attributes, javascript: URLs.
    function sanitizeRichHtml(html) {
        if (!html) return '';
        return String(html)
            .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
            .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
            .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
            .replace(/javascript:/gi, '');
    }

    // -------- 3. RESOLVE NESTED PATH (e.g. "hero.title") --------
    function getPath(obj, path) {
        return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
    }

    // -------- 4. APPLY SIMPLE TEXT BINDINGS --------
    function applyBindings(data) {
        // Page <title>
        document.title = data.metaTitle || document.title;

        // data-bind="path.to.value"  → textContent
        document.querySelectorAll('[data-bind]').forEach(el => {
            const value = getPath(data, el.dataset.bind);
            if (value == null) return;
            if (el.tagName === 'META' || el.tagName === 'LINK') {
                el.setAttribute('content', value);
                if (el.tagName === 'LINK') el.setAttribute('href', value);
            } else if (el.tagName === 'TITLE') {
                el.textContent = value;
            } else {
                el.textContent = value;
            }
        });

        // data-bind-attr="src:hero.image,alt:hero.imageAlt"
        document.querySelectorAll('[data-bind-attr]').forEach(el => {
            el.dataset.bindAttr.split(',').forEach(pair => {
                const [attr, path] = pair.split(':').map(s => s.trim());
                const value = getPath(data, path);
                if (value != null) el.setAttribute(attr, value);
            });
        });

        // Canonical URL
        const canonical = document.querySelector('link[data-bind="canonical"]');
        if (canonical) canonical.setAttribute('href', window.location.href);
    }

    // -------- 5. RENDERERS --------
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

        'products': (mount, data) => {
            const items = data.products || [];
            mount.innerHTML = items.map(p => `
                <article class="product-card">
                    <div class="product-card__image">
                        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy">
                    </div>
                    <div class="product-card__body">
                        ${p.brand ? `<div class="product-card__brand">${escapeHtml(p.brand)}</div>` : ''}
                        <h3 class="product-card__title">${escapeHtml(p.title)}</h3>
                        <p class="product-card__description">${escapeHtml(p.description)}</p>
                        ${p.usage ? `<div class="product-card__usage"><strong>Recommended for</strong>${escapeHtml(p.usage)}</div>` : ''}
                        <a href="${escapeHtml(p.ctaUrl)}" class="product-card__cta" target="_blank" rel="noopener" data-product="${escapeHtml(p.title)}">
                            ${escapeHtml(p.ctaLabel || 'View Product')}
                        </a>
                    </div>
                </article>
            `).join('');

            // Track clicks for future analytics (Google Analytics / Mixpanel)
            mount.querySelectorAll('.product-card__cta').forEach(link => {
                link.addEventListener('click', (e) => {
                    if (window.gtag) {
                        window.gtag('event', 'product_click', {
                            product: link.dataset.product,
                            pain_area: data.slug,
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

            // SEO bonus: emit FAQPage structured data
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
            if (!items.length) {
                mount.closest('[data-section="blog"]').style.display = 'none';
                return;
            }
            mount.innerHTML = items.map(b => `
                <a href="${escapeHtml(b.url)}" class="blog-card" target="${b.external ? '_blank' : '_self'}" ${b.external ? 'rel="noopener"' : ''}>
                    <div class="blog-card__image">
                        <img src="${escapeHtml(b.image)}" alt="${escapeHtml(b.title)}" loading="lazy">
                    </div>
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
                const cls = btn.style === 'outline' || btn.style === 'secondary' ? 'btn btn--secondary' : 'btn btn--primary';
                const target = btn.external ? ' target="_blank" rel="noopener"' : '';
                return `<a href="${escapeHtml(btn.href)}" class="${cls}"${target}>${escapeHtml(btn.label)}</a>`;
            }).join('');
        }
    };

    // -------- 6. CAROUSEL --------
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

        // Touch
        let startX = 0;
        track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stop(); }, { passive: true });
        track.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 50) goto(idx + (diff < 0 ? 1 : -1));
            start();
        });

        start();
    }

    // -------- 7. RUN ALL RENDERERS --------
    function renderAll(data) {
        Object.keys(renderers).forEach(key => {
            const mount = document.querySelector(`[data-render="${key}"]`);
            if (mount) {
                try { renderers[key](mount, data); }
                catch (err) { console.error(`Renderer "${key}" failed:`, err); }
            }
        });
    }

    // -------- 8. ERROR STATE --------
    function showError(msg, hint) {
        const loading = document.getElementById('pain-loading');
        const isFileProtocol = window.location.protocol === 'file:';
        const hintHtml = isFileProtocol ? `
            <div style="max-width: 640px; margin: 0 auto 28px; padding: 20px 24px; background-color: rgba(177, 140, 87, 0.10); border-left: 3px solid #B18C57; border-radius: 8px; text-align: left;">
                <p style="margin: 0 0 10px; color: #1F1F1F; font-weight: 600;">Looks like you opened this file directly.</p>
                <p style="margin: 0 0 10px; color: #1F1F1F; font-size: 0.95rem; line-height: 1.7;">Browsers block <code>fetch()</code> on <code>file://</code> URLs for security. To preview locally:</p>
                <ol style="margin: 0 0 0 20px; color: #1F1F1F; font-size: 0.95rem; line-height: 1.8;">
                    <li>Double-click <strong>start-server.bat</strong> in the project folder</li>
                    <li>Open <a href="http://localhost:8000/pain.html?area=knee" style="color: #B18C57; font-weight: 600;">http://localhost:8000/pain.html?area=knee</a></li>
                </ol>
                <p style="margin: 12px 0 0; color: #6C6C6C; font-size: 0.85rem;">Or in VS Code: install the <em>Live Server</em> extension, right-click <code>pain.html</code> → Open with Live Server.</p>
            </div>` : (hint ? `<p style="color: var(--color-muted); margin-bottom: 24px; font-size: 0.92rem;">${escapeHtml(hint)}</p>` : '');

        loading.innerHTML = `
            <div class="container" style="text-align:center; padding: 80px 0;">
                <h2 style="color: var(--color-primary); margin-bottom: 12px;">${isFileProtocol ? 'Preview server needed' : 'Page not found'}</h2>
                <p style="color: var(--color-muted); margin-bottom: 24px;">${escapeHtml(msg)}</p>
                ${hintHtml}
                <a href="index.html" class="btn btn--primary">Back to Home</a>
            </div>`;
    }

    // -------- 9. HEADER STICKY + BACK TO TOP --------
    function bindGlobalUi() {
        const header = document.getElementById('site-header');
        const backToTop = document.getElementById('back-to-top');
        window.addEventListener('scroll', () => {
            const y = window.pageYOffset;
            if (header) header.classList.toggle('scrolled', y > 100);
            if (backToTop) backToTop.classList.toggle('visible', y > 400);
        });
        if (backToTop) {
            backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }
    }

    // -------- 10. INIT --------
    async function init() {
        bindGlobalUi();

        // Catch the file:// pitfall up-front with a friendly message
        if (window.location.protocol === 'file:') {
            showError('This page loads content dynamically and needs to run on a local web server, not opened directly from your file system.');
            return;
        }

        const slug = getSlug();
        try {
            const res = await fetch(`data/${slug}.json`, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`Failed to load data/${slug}.json (${res.status})`);
            const data = await res.json();
            data.slug = data.slug || slug;

            applyBindings(data);
            renderAll(data);

            // Reveal main, hide loading
            document.getElementById('pain-loading').style.display = 'none';
            document.getElementById('pain-main').hidden = false;

            // Scroll to anchor if present
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
