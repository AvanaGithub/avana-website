/* Compress the kodiak hero PNG. 2.6 MB at 1254×1254 → ~150 KB JPG.
   The hero displays at ~600px on desktop, so 1600px wide is plenty.
   Converts PNG → JPG (no transparency needed on the kodiak hero).

   Run from repo root:  node _imgtools/compress-kodiak.cjs
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGETS = [
    { file: 'images/kodiak/hero-kodiak.png',                       maxWidth: 1600, quality: 82, toJpg: true },
    { file: 'images/kodiak/breg kodiak website banner image.png',  maxWidth: 1800, quality: 80, toJpg: true },
    { file: 'images/kodiak/Breg kodiak.jpg',                       maxWidth: 1400, quality: 82, toJpg: false },
];

const human = b => b < 1024 ? `${b} B` : b < 1024*1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/1024/1024).toFixed(2)} MB`;

(async () => {
    let before = 0, after = 0;
    const renames = [];
    for (const t of TARGETS) {
        if (!fs.existsSync(t.file)) { console.log(`skip (missing): ${t.file}`); continue; }
        const orig = fs.statSync(t.file).size;
        const dir = path.dirname(t.file);
        const base = path.basename(t.file);
        const outName = t.toJpg ? base.replace(/\.png$/i, '.jpg') : base;
        const out = path.join(dir, outName);

        let p = sharp(fs.readFileSync(t.file)).resize({ width: t.maxWidth, withoutEnlargement: true, fit: 'inside' }).rotate();
        p = t.toJpg
            ? p.jpeg({ quality: t.quality, mozjpeg: true, progressive: true })
            : p.jpeg({ quality: t.quality, mozjpeg: true, progressive: true });
        const buf = await p.toBuffer();

        if (outName !== base) {
            fs.writeFileSync(out, buf);
            fs.unlinkSync(t.file);
            renames.push({ from: t.file, to: out });
        } else {
            fs.writeFileSync(out, buf);
        }
        const pct = ((1 - buf.length / orig) * 100).toFixed(0);
        console.log(`  ${base.padEnd(40)}  ${human(orig).padStart(10)} → ${human(buf.length).padStart(10)}  (-${pct}%)${outName !== base ? '  → ' + outName : ''}`);
        before += orig; after += buf.length;
    }
    console.log('-'.repeat(72));
    console.log(`TOTAL  ${human(before).padStart(56)} → ${human(after).padStart(10)}  (-${((1 - after / before) * 100).toFixed(1)}%)`);
    if (renames.length) {
        console.log('\nRENAMED (update HTML refs):');
        renames.forEach(r => console.log(`  ${r.from}  →  ${r.to}`));
    }
})();
