/* ============================================================
   Freestyle OA landing — script
   FAQ accordion (single-open behavior), WhatsApp bubble events.
   Minimal vanilla JS, no dependencies.
   ============================================================ */

(function () {
    'use strict';

    /* ---------- FAQ: only one open at a time ---------- */
    function initFaq() {
        const items = document.querySelectorAll('.faq__item');
        items.forEach(item => {
            item.addEventListener('toggle', () => {
                if (item.open) {
                    items.forEach(other => {
                        if (other !== item) other.open = false;
                    });
                }
            });
        });
    }

    /* ---------- WhatsApp bubble: click event + subtle ripple boost on hover ---------- */
    function initWhatsApp() {
        const bubble = document.querySelector('.wa-bubble');
        if (!bubble) return;

        bubble.addEventListener('click', () => {
            try {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'whatsapp_click',
                    source: 'freestyle-oa-landing',
                    location: 'floating-bubble'
                });
                if (typeof window.fbq === 'function') {
                    window.fbq('track', 'Contact', { method: 'whatsapp' });
                }
            } catch (e) { /* silent */ }
        });
    }

    /* ---------- Smooth-scroll fallback for anchor links (browsers with scroll-behavior support already handle it) ---------- */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId.length <= 1) return;
                const target = document.querySelector(targetId);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /* ---------- Testimonials (doctors + patients) loaded from data.json ---------- */
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function initials(name) {
        // "Dr. Vikram A Mhaskar" -> "VM" ; "Naga Mani" -> "NM"
        const parts = String(name || '').replace(/^Dr\.?\s+/i, '').trim().split(/\s+/);
        const first = (parts[0] || '?').charAt(0);
        const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
        return (first + last).toUpperCase();
    }
    function avatarHtml(person, sizeClass) {
        if (person.photo) {
            return `<img src="${esc(person.photo)}" alt="${esc(person.name)}" loading="lazy" class="${sizeClass}">`;
        }
        return `<span class="${sizeClass} ${sizeClass}--initials" aria-hidden="true">${esc(initials(person.name))}</span>`;
    }
    function renderDoctorCard(d) {
        const location = [d.hospital, d.city].filter(Boolean).map(esc).join(' · ');
        return `
            <article class="doctor-card">
                ${avatarHtml(d, 'doctor-card__photo')}
                <h3 class="doctor-card__name">${esc(d.name)}</h3>
                ${d.credentials ? `<p class="doctor-card__creds">${esc(d.credentials)}</p>` : ''}
                ${location ? `<p class="doctor-card__hospital">${location}</p>` : ''}
                <p class="doctor-card__quote">&ldquo;${esc(d.quote)}&rdquo;</p>
            </article>`;
    }
    function renderPatientCard(p) {
        const stars = '★'.repeat(Math.max(0, Math.min(5, Number(p.stars) || 5)));
        return `
            <figure class="testimonial-card">
                ${avatarHtml(p, 'testimonial-card__photo')}
                <div class="testimonial-card__stars" aria-label="${stars.length} out of 5 stars">${stars}</div>
                <blockquote class="testimonial-card__quote">&ldquo;${esc(p.quote)}&rdquo;</blockquote>
                <figcaption class="testimonial-card__author">
                    ${esc(p.name)}${p.role ? ` <span class="testimonial-card__role">&mdash; ${esc(p.role)}</span>` : ''}
                </figcaption>
            </figure>`;
    }
    function initDoctorCarousel(track, totalCards) {
        const prev = document.getElementById('doctor-prev');
        const next = document.getElementById('doctor-next');
        if (!prev || !next || totalCards === 0) return;
        let index = 0;

        function visibleCount() {
            const w = window.innerWidth;
            if (w <= 600) return 1;
            if (w <= 900) return 2;
            return 3;
        }
        function maxIndex() {
            return Math.max(0, totalCards - visibleCount());
        }
        function update() {
            if (index > maxIndex()) index = maxIndex();
            const first = track.querySelector('.doctor-card');
            if (!first) return;
            const cardWidth = first.getBoundingClientRect().width;
            const gap = parseFloat(getComputedStyle(track).gap) || 20;
            const offset = index * (cardWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
            prev.disabled = index === 0;
            next.disabled = index >= maxIndex();
        }
        prev.addEventListener('click', () => { index = Math.max(0, index - 1); update(); });
        next.addEventListener('click', () => { index = Math.min(maxIndex(), index + 1); update(); });
        window.addEventListener('resize', update);
        // initial measurement after images size themselves
        setTimeout(update, 100);
    }

    async function initTestimonials() {
        const docEl = document.getElementById('doctor-grid');
        const patEl = document.getElementById('patient-row');
        const nav = document.getElementById('doctor-grid-nav');
        const moreBtn = document.getElementById('doctor-grid-more');
        if (!docEl && !patEl) return;

        let data = null;
        try {
            const res = await fetch('data.json', { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            data = await res.json();
        } catch (e) {
            if (docEl) docEl.innerHTML = '<p class="section__body">Testimonials will appear here shortly.</p>';
            return;
        }

        if (docEl && data.doctors && data.doctors.length) {
            docEl.innerHTML = data.doctors.map(renderDoctorCard).join('');
            initDoctorCarousel(docEl, data.doctors.length);
        }
        if (patEl && data.patients && data.patients.length) {
            patEl.innerHTML = data.patients.map(renderPatientCard).join('');
        }
    }

    /* ---------- Hero slider: crossfade every 2 seconds, no controls ---------- */
    function initHeroSlider() {
        const container = document.getElementById('hero-slider');
        if (!container) return;
        const slides = container.querySelectorAll('.hero-slide');
        if (slides.length < 2) return;
        // Respect reduced motion — hold on first slide, no rotation.
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let i = 0;
        setInterval(() => {
            slides[i].classList.remove('is-active');
            i = (i + 1) % slides.length;
            slides[i].classList.add('is-active');
        }, 2000);
    }

    function init() {
        initFaq();
        initWhatsApp();
        initSmoothScroll();
        initTestimonials();
        initHeroSlider();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
