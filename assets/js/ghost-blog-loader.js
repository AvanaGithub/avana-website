/* ============================================================
   AVANA — Ghost CMS blog loader (homepage)
   Reads data/ghost-config.json. If Ghost is reachable and enabled,
   fetches the N most recent posts via the Content API and rewrites
   the homepage .blog-grid + 'View All Posts' button. If anything
   fails (Ghost not yet running, network error, empty result), it
   silently leaves the static placeholder cards in place — so the
   page never renders broken.
   ============================================================ */

(function () {
    'use strict';

    const grid = document.querySelector('.blog-section .blog-grid');
    const viewAllBtn = document.querySelector('.blog-section__cta .btn');
    if (!grid) return; // not on a page with the blog section

    /* ---------- helpers ---------- */
    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function formatDate(iso) {
        try {
            return new Date(iso).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        } catch (_) { return ''; }
    }

    function trimExcerpt(s, max = 140) {
        if (!s) return '';
        const clean = String(s).replace(/\s+/g, ' ').trim();
        return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean;
    }

    /* ---------- render ---------- */
    function renderPosts(posts, blogUrl) {
        grid.innerHTML = posts.map(p => {
            const url = p.url || `${blogUrl.replace(/\/$/, '')}/${encodeURIComponent(p.slug)}/`;
            const img = p.feature_image
                ? `<img src="${escapeHtml(p.feature_image)}" alt="${escapeHtml(p.title)}" loading="lazy" onerror="this.style.display='none'">`
                : `<div class="blog-card__image-placeholder" aria-hidden="true">${escapeHtml(p.title || '').slice(0, 30)}</div>`;
            const excerpt = trimExcerpt(p.custom_excerpt || p.excerpt, 140);
            return `
                <a href="${escapeHtml(url)}" class="blog-card" target="_blank" rel="noopener">
                    <div class="blog-card__image">${img}</div>
                    <div class="blog-card__content">
                        <span class="blog-card__date">${escapeHtml(formatDate(p.published_at))}</span>
                        <h3 class="blog-card__title">${escapeHtml(p.title || 'Untitled')}</h3>
                        <p class="blog-card__excerpt">${escapeHtml(excerpt)}</p>
                        <span class="blog-card__link">Read more →</span>
                    </div>
                </a>
            `;
        }).join('');

        if (viewAllBtn && blogUrl) {
            viewAllBtn.setAttribute('href', blogUrl);
            viewAllBtn.setAttribute('target', '_blank');
            viewAllBtn.setAttribute('rel', 'noopener');
        }
    }

    /* ---------- bootstrap ---------- */
    fetch('/data/ghost-config.json')
        .then(r => r.ok ? r.json() : Promise.reject('config fetch failed'))
        .then(cfg => {
            // Guard rails: only attempt the live fetch if all of these are true.
            if (!cfg.enabled) return null;
            if (!cfg.apiUrl || !cfg.contentApiKey) return null;
            if (cfg.contentApiKey.length < 20) return null;

            const limit = parseInt(cfg.postsPerPage, 10) || 3;
            const url = `${cfg.apiUrl.replace(/\/$/, '')}/ghost/api/content/posts/`
                + `?key=${encodeURIComponent(cfg.contentApiKey)}`
                + `&limit=${limit}`
                + `&fields=id,title,slug,url,feature_image,published_at,custom_excerpt,excerpt`
                + `&order=published_at desc`;

            return fetch(url).then(r => {
                if (!r.ok) throw new Error('Ghost API HTTP ' + r.status);
                return r.json();
            }).then(json => ({ posts: (json && json.posts) || [], blogUrl: cfg.blogUrl || cfg.apiUrl }));
        })
        .then(result => {
            if (!result || !result.posts.length) return; // keep static fallback
            renderPosts(result.posts, result.blogUrl);
        })
        .catch(err => {
            // Network error, CORS, Ghost down, key invalid → keep the static
            // placeholder cards already in the markup. Log for diagnostics only.
            console.warn('Ghost blog loader skipped:', err);
        });
})();
