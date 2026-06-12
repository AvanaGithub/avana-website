/* ============================================================
   AVANA ABOUT US LOADER
   Fetches data/about.json and renders all sections.
   Same pattern as solution-loader.js — all content lives in
   the JSON; edit the JSON and git push to update the live page.
   ============================================================ */

(function () {
    'use strict';

    /* ------ Helpers ------ */
    function escapeHtml(s) {
        return String(s ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function getPath(obj, path) {
        return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
    }

    /* ------ Simple data-bind (same as solution-loader) ------ */
    function applyBindings(data) {
        document.title = data.metaTitle || document.title;
        const descTag = document.querySelector('meta[name="description"]');
        if (descTag && data.metaDescription) descTag.setAttribute('content', data.metaDescription);

        document.querySelectorAll('[data-bind]').forEach(el => {
            const value = getPath(data, el.dataset.bind);
            if (value == null) return;
            if (el.tagName === 'META') el.setAttribute('content', value);
            else el.textContent = value;
        });
    }

    /* ------ Renderers ------ */

    function renderIntro(data) {
        const el = document.getElementById('about-intro');
        if (!el) return;
        const paras = (data.intro && Array.isArray(data.intro.paragraphs))
            ? data.intro.paragraphs : [];
        if (!paras.length) { el.closest('.about-section').style.display = 'none'; return; }
        el.innerHTML = paras.map(p => `<p>${escapeHtml(p)}</p>`).join('');
    }

    function renderStats(data) {
        const el = document.getElementById('about-stats');
        if (!el) return;
        const items = data.stats || [];
        if (!items.length) { el.closest('.about-stats-strip').style.display = 'none'; return; }
        el.innerHTML = items.map(s => `
            <div class="about-stat">
                <span class="about-stat__value">${escapeHtml(s.value)}</span>
                <span class="about-stat__label">${escapeHtml(s.label)}</span>
            </div>`).join('');
    }

    function renderPillars(data) {
        const el = document.getElementById('about-pillars');
        if (!el) return;
        const pillars = data.pillars || [];
        if (!pillars.length) { document.getElementById('about-pillars-section').style.display = 'none'; return; }

        el.innerHTML = pillars.map(p => {
            const isRight = p.layout === 'image-right';
            const imgEl = p.image
                ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.imageAlt || p.title)}" loading="lazy">`
                : '';
            return `
            <div class="about-pillar ${isRight ? 'about-pillar--image-right' : 'about-pillar--image-left'}">
                <div class="about-pillar__image">${imgEl}</div>
                <div class="about-pillar__content">
                    <span class="about-pillar__eyebrow">${escapeHtml(p.eyebrow || '')}</span>
                    <h3 class="about-pillar__title">${escapeHtml(p.title)}</h3>
                    <p class="about-pillar__body">${escapeHtml(p.body)}</p>
                </div>
            </div>`;
        }).join('');
    }

    function renderAchievements(data) {
        const el = document.getElementById('about-achievements');
        if (!el) return;
        const items = data.achievements || [];
        if (!items.length) { el.closest('.about-section').style.display = 'none'; return; }
        el.innerHTML = items.map(a => `
            <div class="about-achievement-card">
                <span class="about-achievement-card__icon">${escapeHtml(a.icon || '🏆')}</span>
                <h4 class="about-achievement-card__title">${escapeHtml(a.title)}</h4>
                <p class="about-achievement-card__body">${escapeHtml(a.body)}</p>
            </div>`).join('');
    }

    function renderLeadership(data) {
        const el = document.getElementById('about-leadership');
        if (!el) return;
        const leaders = data.leadership || [];
        if (!leaders.length) { el.closest('.about-section').style.display = 'none'; return; }
        el.innerHTML = leaders.map(l => {
            const photoContent = l.photo
                ? `<img src="${escapeHtml(l.photo)}" alt="${escapeHtml(l.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                : '';
            return `
            <div class="about-leader-card">
                <div class="about-leader-card__photo">
                    ${photoContent}
                    <div class="about-leader-card__photo-placeholder" ${l.photo ? 'style="display:none"' : ''}>👤</div>
                </div>
                <div class="about-leader-card__body">
                    <h3 class="about-leader-card__name">${escapeHtml(l.name)}</h3>
                    <div class="about-leader-card__title">${escapeHtml(l.title)}</div>
                    ${l.subtitle ? `<div class="about-leader-card__subtitle">${escapeHtml(l.subtitle)}</div>` : ''}
                    ${l.bio ? `<p class="about-leader-card__bio">${escapeHtml(l.bio)}</p>` : ''}
                </div>
            </div>`;
        }).join('');
    }

    /* ------ Shared lightbox state ------ */
    let _photos = [], _idx = 0, _wired = false;

    function openLightbox(photos, idx) {
        const lb = document.getElementById('lightbox');
        if (!lb || !photos.length) return;
        _photos = photos;
        wireLightbox();
        showAt(idx || 0);
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function showAt(i) {
        _idx = (i + _photos.length) % _photos.length;
        document.getElementById('lightbox-img').src = _photos[_idx].src || _photos[_idx];
        document.getElementById('lightbox-counter').textContent = `${_idx + 1} / ${_photos.length}`;
    }
    function closeLightbox() {
        document.getElementById('lightbox').classList.remove('open');
        document.body.style.overflow = '';
    }
    function wireLightbox() {
        if (_wired) return;
        document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
        document.getElementById('lightbox-prev').addEventListener('click', () => showAt(_idx - 1));
        document.getElementById('lightbox-next').addEventListener('click', () => showAt(_idx + 1));
        document.getElementById('lightbox').addEventListener('click', e => { if (e.target === e.currentTarget) closeLightbox(); });
        document.addEventListener('keydown', e => {
            if (!document.getElementById('lightbox').classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') showAt(_idx - 1);
            else if (e.key === 'ArrowRight') showAt(_idx + 1);
        });
        _wired = true;
    }

    function renderPhotoCarousel(data) {
        const el = document.getElementById('about-photo-carousel');
        const section = document.getElementById('about-carousel-section');
        if (!el) return;
        const pc = data.photoCarousel;
        const images = (pc && Array.isArray(pc.images)) ? pc.images : [];
        if (!images.length) { if (section) section.style.display = 'none'; return; }

        // Normalise: items can be strings or { src, alt } objects
        const photos = images.map(img => typeof img === 'string'
            ? { src: img, alt: '' }
            : img);

        const slides = photos.map((img, i) =>
            `<button type="button" class="about-photo-carousel__slide" data-idx="${i}" aria-label="Open photo ${i + 1}">
                <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" loading="lazy"
                     onerror="this.parentElement.style.display='none'">
            </button>`
        ).join('');

        el.innerHTML = `
            <div class="about-photo-carousel__track" id="about-carousel-track">${slides}</div>
            <div class="about-photo-carousel__arrows">
                <button class="about-photo-carousel__arrow" id="about-carousel-prev" aria-label="Previous">‹</button>
                <button class="about-photo-carousel__arrow" id="about-carousel-next" aria-label="Next">›</button>
            </div>`;

        el.querySelectorAll('.about-photo-carousel__slide').forEach(btn => {
            btn.addEventListener('click', () => openLightbox(photos, parseInt(btn.dataset.idx, 10)));
        });

        const track = document.getElementById('about-carousel-track');
        function step(dir) {
            const slide = track.querySelector('.about-photo-carousel__slide');
            if (!slide) return;
            const w = slide.getBoundingClientRect().width + 16;
            track.scrollBy({ left: dir * w * 2, behavior: 'smooth' });
        }
        document.getElementById('about-carousel-prev').addEventListener('click', () => step(-1));
        document.getElementById('about-carousel-next').addEventListener('click', () => step(1));

        // Auto-advance every 4s; pause on hover
        let timer = null;
        function startAuto() {
            stopAuto();
            timer = setInterval(() => {
                const maxScroll = track.scrollWidth - track.clientWidth;
                if (track.scrollLeft >= maxScroll - 4) track.scrollTo({ left: 0, behavior: 'smooth' });
                else step(1);
            }, 4000);
        }
        function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
        el.addEventListener('mouseenter', stopAuto);
        el.addEventListener('mouseleave', startAuto);
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => e.isIntersecting ? startAuto() : stopAuto());
        }, { threshold: 0.2 });
        io.observe(el);
    }

    function renderTestimonials(data) {
        const el = document.getElementById('about-testimonials');
        if (!el) return;
        const items = data.testimonials || [];
        if (!items.length) { el.closest('.about-section').style.display = 'none'; return; }

        // Preview length for the collapsed view. Long employee stories
        // are clipped to the first PREVIEW_WORD_COUNT words plus an
        // ellipsis; the full text reveals on Read more.
        const PREVIEW_WORD_COUNT = 50;

        function buildQuoteBlocks(quote) {
            const fullText = String(quote || '').trim();
            const paragraphs = fullText
                .split(/\n\s*\n+/)
                .map(p => p.trim())
                .filter(Boolean);
            const words = fullText.split(/\s+/).filter(Boolean);
            const needsToggle = words.length > PREVIEW_WORD_COUNT;

            // Full quote: every paragraph as its own <p>
            const fullHtml = paragraphs
                .map(p => `<p class="about-testimonial-card__quote">${escapeHtml(p)}</p>`)
                .join('');

            if (!needsToggle) {
                return { fullHtml, previewHtml: '', needsToggle: false };
            }

            // Preview: first PREVIEW_WORD_COUNT words + ellipsis
            const previewText = words.slice(0, PREVIEW_WORD_COUNT).join(' ') + '…';
            const previewHtml = `<p class="about-testimonial-card__quote">${escapeHtml(previewText)}</p>`;
            return { fullHtml, previewHtml, needsToggle: true };
        }

        el.innerHTML = items.map(t => {
            const avatarContent = t.avatar
                ? `<img src="${escapeHtml(t.avatar)}" alt="${escapeHtml(t.name)}" loading="lazy">`
                : `<span>💬</span>`;

            const { fullHtml, previewHtml, needsToggle } = buildQuoteBlocks(t.quote);

            const quoteSection = needsToggle
                ? `
                    <div class="about-testimonial-card__quote--preview">${previewHtml}</div>
                    <div class="about-testimonial-card__quote--full">${fullHtml}</div>
                    <button type="button" class="about-testimonial-card__toggle" data-toggle-quote>Read more →</button>`
                : fullHtml;

            return `
            <div class="about-testimonial-card">
                <span class="about-testimonial-card__mark">"</span>
                ${quoteSection}
                <div class="about-testimonial-card__author">
                    <div class="about-testimonial-card__avatar">${avatarContent}</div>
                    <div>
                        <div class="about-testimonial-card__name">${escapeHtml(t.name)}</div>
                        ${t.role ? `<div class="about-testimonial-card__role">${escapeHtml(t.role)}</div>` : ''}
                    </div>
                </div>
            </div>`;
        }).join('');

        // Wire up the Read more / Read less toggles. Delegated to keep it
        // resilient if the card list re-renders later.
        el.addEventListener('click', e => {
            const btn = e.target.closest('[data-toggle-quote]');
            if (!btn) return;
            const card = btn.closest('.about-testimonial-card');
            if (!card) return;
            const expanded = card.classList.toggle('is-expanded');
            btn.textContent = expanded ? 'Read less ↑' : 'Read more →';
        });
    }

    function renderCta(data) {
        const el = document.getElementById('about-cta-buttons');
        if (!el) return;
        const buttons = (data.cta && data.cta.buttons) || [];
        el.innerHTML = buttons.map(btn => {
            const cls = btn.style === 'outline' ? 'btn btn--outline' : 'btn btn--primary';
            return `<a href="${escapeHtml(btn.href)}" class="${cls}">${escapeHtml(btn.label)}</a>`;
        }).join('');
    }

    /* ------ Back to top ------ */
    function initBackToTop() {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;
        window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ------ Main ------ */
    async function init() {
        if (window.location.protocol === 'file:') {
            document.getElementById('about-loading').innerHTML =
                '<div class="container"><p style="color:#6C6C6C;padding:40px 0">Run a local server to preview (<code>start-server.bat</code>) then open <code>http://localhost:8000/about.html</code></p></div>';
            return;
        }

        try {
            const res = await fetch('/data/about.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();

            applyBindings(data);
            renderIntro(data);
            renderStats(data);
            renderPillars(data);
            renderAchievements(data);
            renderLeadership(data);
            renderPhotoCarousel(data);
            renderTestimonials(data);
            renderCta(data);

            document.getElementById('about-loading').style.display = 'none';
            document.getElementById('about-main').hidden = false;

            initBackToTop();

            // Smooth scroll to hash if present
            if (window.location.hash) {
                setTimeout(() => {
                    const t = document.querySelector(window.location.hash);
                    if (t) t.scrollIntoView({ behavior: 'smooth' });
                }, 200);
            }
        } catch (err) {
            console.error(err);
            document.getElementById('about-loading').innerHTML =
                `<div class="container" style="padding:60px 0;text-align:center">
                    <p style="color:#C44545;font-weight:600;">Could not load about page content.</p>
                    <p style="color:#6C6C6C;font-size:0.9rem;">${escapeHtml(err.message)}</p>
                </div>`;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
