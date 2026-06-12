/* ============================================================
   AVANA — Training programme detail page
   Loads data/training-programs.json, picks the program matching
   ?slug=... from the URL, and renders the full detail view.
   ============================================================ */

(function () {
    'use strict';

    const loadingEl = document.getElementById('training-detail-loading');
    const contentEl = document.getElementById('training-detail-content');
    const errorEl   = document.getElementById('training-detail-error');

    if (!contentEl) return; // page didn't load — bail

    /* ---------- helpers ---------- */
    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function getSlugFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug');
    }

    function formatDateRange(p) {
        const opts = { year: 'numeric', month: 'short', day: 'numeric' };
        const start = new Date(p.date);
        if (!p.endDate || p.endDate === p.date) {
            return start.toLocaleDateString('en-GB', opts);
        }
        const end = new Date(p.endDate);
        // same month/year — short form
        if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
            return `${start.getDate()}–${end.getDate()} ${end.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
        }
        return `${start.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', opts)}`;
    }

    function activityLabel(slug, vocab) {
        const found = (vocab.activities || []).find(a => a.slug === slug);
        return found ? found.label : slug;
    }

    function programPhotoPaths(p) {
        const n = p.photoCount || 0;
        const folder = p.photoFolder || (`/images/training/${p.slug}/`);
        const paths = [];
        for (let i = 1; i <= n; i++) {
            paths.push(`${folder}${String(i).padStart(2, '0')}.jpg`);
        }
        return paths;
    }

    function isPast(p) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(p.endDate || p.date);
        target.setHours(0, 0, 0, 0);
        return target < today;
    }

    /* ---------- lightbox (mini) ---------- */
    let _lbPhotos = [];
    let _lbIdx = 0;
    let _lbWired = false;

    function showLightboxAt(i) {
        const lb = document.getElementById('lightbox');
        const img = document.getElementById('lightbox-img');
        const counter = document.getElementById('lightbox-counter');
        if (!lb || !img || !_lbPhotos.length) return;
        _lbIdx = (i + _lbPhotos.length) % _lbPhotos.length;
        img.src = _lbPhotos[_lbIdx];
        if (counter) counter.textContent = `${_lbIdx + 1} / ${_lbPhotos.length}`;
        lb.classList.add('lightbox--open');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        const lb = document.getElementById('lightbox');
        if (!lb) return;
        lb.classList.remove('lightbox--open');
        document.body.style.overflow = '';
    }
    function openLightbox(photos, idx) {
        _lbPhotos = photos;
        if (!_lbWired) {
            _lbWired = true;
            document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
            document.getElementById('lightbox-prev')?.addEventListener('click', () => showLightboxAt(_lbIdx - 1));
            document.getElementById('lightbox-next')?.addEventListener('click', () => showLightboxAt(_lbIdx + 1));
            document.getElementById('lightbox')?.addEventListener('click', e => {
                if (e.target.id === 'lightbox') closeLightbox();
            });
            document.addEventListener('keydown', e => {
                const lb = document.getElementById('lightbox');
                if (!lb || !lb.classList.contains('lightbox--open')) return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft')  showLightboxAt(_lbIdx - 1);
                if (e.key === 'ArrowRight') showLightboxAt(_lbIdx + 1);
            });
        }
        showLightboxAt(idx || 0);
    }

    /* ---------- render ---------- */
    function render(program, vocab) {
        const past = isPast(program);
        const dateStr = formatDateRange(program);
        const doctors = (program.doctors || []).join(', ');
        const photos = programPhotoPaths(program);

        const eyebrowClass = past ? 'training-detail__eyebrow training-detail__eyebrow--past' : 'training-detail__eyebrow';
        const eyebrowText  = past ? 'Past Programme' : 'Upcoming Programme';

        const activitiesHtml = (program.activities || []).map(slug =>
            `<span class="training-detail__activity">${escapeHtml(activityLabel(slug, vocab))}</span>`
        ).join('');

        // Fee + seats computed once, used by meta items AND CTA bar
        const hasFee = typeof program.fee === 'number';
        const hasSeats = typeof program.seatsTotal === 'number';
        const seatsBooked = typeof program.seatsBooked === 'number' ? program.seatsBooked : 0;
        const seatsRemaining = hasSeats ? Math.max(0, program.seatsTotal - seatsBooked) : null;
        const isSoldOut = !past && hasSeats && seatsRemaining === 0;
        const feeIsFree = hasFee && program.fee === 0;
        const feeLabel = !hasFee ? null : feeIsFree ? 'Free' : '₹' + Number(program.fee).toLocaleString('en-IN');

        const metaItems = [
            { label: 'Date',    value: dateStr },
            doctors                ? { label: 'Faculty', value: doctors } : null,
            program.place          ? { label: 'Where',   value: program.place + (program.venue ? ` · ${program.venue}` : '') } : null,
            !past && hasFee        ? { label: 'Fee',     value: feeLabel } : null,
            !past && hasSeats      ? { label: 'Seats',   value: isSoldOut ? 'Sold out' : `${seatsRemaining} of ${program.seatsTotal} remaining` } : null,
        ].filter(Boolean).map(item =>
            `<div class="training-detail__meta-item">
                <span class="training-detail__meta-label">${escapeHtml(item.label)}</span>
                <span class="training-detail__meta-value">${escapeHtml(item.value)}</span>
            </div>`
        ).join('');

        const photoGalleryHtml = photos.length
            ? `<div class="training-detail__section">
                   <h2 class="training-detail__section-title">Photo gallery</h2>
                   <div class="training-detail__photos" id="training-detail-photos">
                       ${photos.map((src, i) =>
                           `<button type="button" data-photo-idx="${i}" aria-label="Open photo ${i + 1}">
                                <img src="${escapeHtml(src)}" alt="${escapeHtml(program.name)} photo ${i + 1}" loading="lazy" onerror="this.parentElement.style.display='none'">
                            </button>`
                       ).join('')}
                   </div>
               </div>`
            : '';

        const highlightsHtml = Array.isArray(program.highlights) && program.highlights.length
            ? `<div class="training-detail__section">
                   <h2 class="training-detail__section-title">Highlights</h2>
                   <ul class="training-detail__list">
                       ${program.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
                   </ul>
               </div>`
            : '';

        // CTA bar — different for past vs upcoming
        let ctaBar = '';
        if (past) {
            ctaBar = `
                <div class="training-detail__cta-bar">
                    <div class="training-detail__cta-text">
                        <strong>This programme has concluded.</strong><br>
                        Interested in a future edition or a similar workshop? Talk to our team.
                    </div>
                    <div class="training-detail__cta-buttons">
                        <a href="#enquiry-modal" class="training-detail__btn training-detail__btn--outline">Enquire Now</a>
                    </div>
                </div>`;
        } else if (isSoldOut) {
            ctaBar = `
                <div class="training-detail__cta-bar">
                    <div class="training-detail__cta-text">
                        <strong>This programme is sold out.</strong><br>
                        Add your name to the waitlist or ask about a future edition.
                    </div>
                    <div class="training-detail__cta-buttons">
                        <a href="#enquiry-modal" class="training-detail__btn training-detail__btn--outline">Join Waitlist</a>
                        <span class="training-detail__btn training-detail__btn--soldout" aria-disabled="true">Sold Out</span>
                    </div>
                </div>`;
        } else {
            const regUrl = program.registrationUrl || `mailto:info@avanasurgical.com?subject=${encodeURIComponent('Registration: ' + program.name)}`;
            const isExternal = /^https?:/i.test(regUrl);
            const targetAttr = isExternal ? ' target="_blank" rel="noopener"' : '';
            ctaBar = `
                <div class="training-detail__cta-bar">
                    <div class="training-detail__cta-text">
                        <strong>Register to attend.</strong><br>
                        Secure your seat by completing the registration & payment.
                    </div>
                    <div class="training-detail__cta-buttons">
                        <a href="#enquiry-modal" class="training-detail__btn training-detail__btn--outline">Enquire</a>
                        <a href="${escapeHtml(regUrl)}" class="training-detail__btn training-detail__btn--primary"${targetAttr}>Register Now</a>
                    </div>
                </div>`;
        }

        contentEl.innerHTML = `
            <span class="${eyebrowClass}">${eyebrowText}</span>
            <h1 class="training-detail__title">${escapeHtml(program.name)}</h1>
            ${activitiesHtml ? `<div class="training-detail__activities">${activitiesHtml}</div>` : ''}

            <div class="training-detail__meta">${metaItems}</div>

            ${program.description
                ? `<div class="training-detail__section">
                       <h2 class="training-detail__section-title">About the programme</h2>
                       <p class="training-detail__description">${escapeHtml(program.description)}</p>
                   </div>`
                : ''}

            ${highlightsHtml}
            ${photoGalleryHtml}
            ${ctaBar}
        `;

        // Update document title + meta description
        document.title = `${program.name} | Avana Surgical Training`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', `${program.name} — ${dateStr}${doctors ? ' · ' + doctors : ''}${program.place ? ' · ' + program.place : ''}.`);
        }

        // Wire up photo gallery → lightbox
        document.querySelectorAll('#training-detail-photos button').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-photo-idx'), 10) || 0;
                openLightbox(photos, idx);
            });
        });
    }

    /* ---------- bootstrap ---------- */
    const slug = getSlugFromUrl();
    if (!slug) {
        loadingEl.hidden = true;
        errorEl.hidden = false;
        return;
    }

    fetch('/data/training-programs.json')
        .then(r => r.json())
        .then(data => {
            const program = (data.programs || []).find(p => p.slug === slug);
            if (!program) {
                loadingEl.hidden = true;
                errorEl.hidden = false;
                return;
            }
            const vocab = data.controlledVocab || { activities: [] };
            loadingEl.hidden = true;
            contentEl.hidden = false;
            render(program, vocab);
        })
        .catch(err => {
            console.error('Failed to load training programme:', err);
            loadingEl.hidden = true;
            errorEl.hidden = false;
        });
})();
