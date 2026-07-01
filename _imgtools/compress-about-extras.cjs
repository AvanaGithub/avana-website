/* Compress about-page pillars + aaqib avatar.

   Pillars (Purpose / Mission / Vision):
     1.5 MB PNGs at 1536×1024 displayed at ~700px → JPG, max 1200px, q=80
   Aaqib avatar:
     580 KB at 1500×1500 displayed as 44px circle → JPG, max 320px, q=80

   Run from repo root:
     node _imgtools/compress-about-extras.cjs
*/

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGETS = [
    { dir: 'images/about',                 maxWidth: 1200, quality: 80, convertPngToJpg: true,  files: /\.(png|jpg|jpeg)$/i },
    { dir: 'images/employee-testimonials', maxWidth: 320,  quality: 80, convertPngToJpg: false, files: /^aaqib\.(jpg|jpeg)$/i },
];

const SKIP_FILES = new Set(['.gitkeep']);

function humanSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
}

async function compressOne(srcPath, opts) {
    const file = path.basename(srcPath);
    const dir = path.dirname(srcPath);
    const ext = path.extname(file).toLowerCase();
    const origStat = fs.statSync(srcPath);
    const origBytes = origStat.size;

    const inputBuffer = fs.readFileSync(srcPath);
    const isPNG = ext === '.png';
    const wantsJpg = !isPNG || opts.convertPngToJpg;
    const outName = wantsJpg ? file.replace(/\.png$/i, '.jpg') : file;
    const dstPath = path.join(dir, outName);

    let pipeline = sharp(inputBuffer)
        .resize({ width: opts.maxWidth, withoutEnlargement: true, fit: 'inside' })
        .rotate();

    if (wantsJpg) {
        pipeline = pipeline.jpeg({ quality: opts.quality, mozjpeg: true, progressive: true });
    } else {
        pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    }

    const outputBuffer = await pipeline.toBuffer();

    if (isPNG && outName !== file) {
        fs.writeFileSync(dstPath, outputBuffer);
        fs.unlinkSync(srcPath);
    } else {
        fs.writeFileSync(dstPath, outputBuffer);
    }

    return { src: srcPath, dst: dstPath, origBytes, newBytes: outputBuffer.length, renamed: outName !== file };
}

(async function () {
    let grandBefore = 0, grandAfter = 0;
    const renames = [];

    for (const t of TARGETS) {
        if (!fs.existsSync(t.dir)) {
            console.log(`(skip ${t.dir} — not found)`);
            continue;
        }
        const files = fs.readdirSync(t.dir)
            .filter(f => !SKIP_FILES.has(f) && t.files.test(f))
            .sort();

        if (!files.length) {
            console.log(`(skip ${t.dir} — no matching files)`);
            continue;
        }

        console.log(`\n${t.dir}/  (max ${t.maxWidth}px, q=${t.quality}${t.convertPngToJpg ? ', PNG→JPG' : ''})`);
        console.log('-'.repeat(72));

        for (const f of files) {
            try {
                const r = await compressOne(path.join(t.dir, f), t);
                const pct = ((1 - r.newBytes / r.origBytes) * 100).toFixed(0);
                const note = r.renamed ? `  →  ${path.basename(r.dst)}` : '';
                console.log(`  ${f.padEnd(34)}  ${humanSize(r.origBytes).padStart(10)}  →  ${humanSize(r.newBytes).padStart(10)}  (-${pct}%)${note}`);
                grandBefore += r.origBytes;
                grandAfter  += r.newBytes;
                if (r.renamed) renames.push({ from: path.join(t.dir, f), to: r.dst });
            } catch (e) {
                console.error(`  ✗ ${f}: ${e.message}`);
            }
        }
    }

    console.log('\n' + '='.repeat(72));
    console.log(`TOTAL  ${humanSize(grandBefore).padStart(48)}  →  ${humanSize(grandAfter).padStart(10)}  (-${((1 - grandAfter / grandBefore) * 100).toFixed(1)}%)`);

    if (renames.length) {
        console.log('\nRenamed (need JSON path updates):');
        renames.forEach(r => console.log(`  ${r.from}  →  ${r.to}`));
    }
})();
