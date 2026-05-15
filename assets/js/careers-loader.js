/* ============================================================
   AVANA CAREERS LOADER
   Fetches data/careers.json and renders open role cards into
   #roles-grid on careers.html. Only roles with active:true appear.

   Workflow:
     HR edits roles in _tools/catalog-editor.html → Careers tab
     → Downloads careers.json → drops file into data/ → git push
     → This script fetches the updated JSON on next page load.
   ============================================================ */

(function () {
    'use strict';

    const GRID_ID    = 'roles-grid';
    const LOADING_ID = 'roles-loading';
    const EMPTY_ID   = 'roles-empty';
    const DATA_URL   = 'data/careers.json';

    function escapeHtml(s) {
        return String(s ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function emailSubject(role) {
        return encodeURIComponent('Application: ' + role.title + (role.department ? ' — ' + role.department : ''));
    }

    function renderCard(role) {
        const dept     = role.department ? `<div class="role-card__division">${escapeHtml(role.department)}</div>` : '';
        const meta     = [role.location, role.type, role.experience].filter(Boolean).join(' · ');
        const desc     = role.description ? `<p class="role-card__desc">${escapeHtml(role.description)}</p>` : '';
        const deadline = role.deadline ? `<p class="role-card__deadline">Apply by ${escapeHtml(role.deadline)}</p>` : '';
        const href     = `mailto:careers@avanasurgical.com?subject=${emailSubject(role)}`;
        return `
            <article class="role-card" data-role-id="${escapeHtml(role.id || '')}">
                ${dept}
                <h3 class="role-card__title">${escapeHtml(role.title)}</h3>
                ${meta ? `<p class="role-card__meta">${escapeHtml(meta)}</p>` : ''}
                ${desc}
                ${deadline}
                <a href="${href}" class="role-card__link">Apply →</a>
            </article>`;
    }

    async function init() {
        const grid    = document.getElementById(GRID_ID);
        const loading = document.getElementById(LOADING_ID);
        const empty   = document.getElementById(EMPTY_ID);
        if (!grid) return; // not on careers page

        if (window.location.protocol === 'file:') {
            // file:// can't fetch — show the static fallback if it exists
            if (loading) loading.style.display = 'none';
            return;
        }

        try {
            const res = await fetch(DATA_URL, { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            const active = (data.openings || []).filter(r => r.active !== false);

            if (loading) loading.style.display = 'none';

            if (!active.length) {
                if (empty) empty.style.display = '';
                return;
            }

            grid.innerHTML = active.map(renderCard).join('');
            grid.hidden = false;
        } catch (err) {
            console.warn('careers-loader: could not load ' + DATA_URL, err);
            // On error, fall back to whatever static HTML was in the grid.
            if (loading) loading.style.display = 'none';
            grid.hidden = false;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
