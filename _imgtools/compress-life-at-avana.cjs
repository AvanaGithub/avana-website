/* One-off image compression for images/life-at-avana/.
   Walks the folder, resizes to max 1400 px wide, recompresses to JPEG
   q=78, strips EXIF. PNG photos converted to JPG (no transparency
   needed). Writes results back to the same paths — overwrites in place.

   Run from repo root:  node _imgtools/compress-life-at-avana.cjs
*/

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = path.resolve(__dirname, '..', 'images', 'life-at-avana');
const MAX_WIDTH = 1400;
const JPEG_QUALITY = 78;

function humanSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1024/1024).toFixed(2) + ' MB';
}

async function compress(file) {
    const src = path.join(SRC_DIR, file);
    const origStat = fs.statSync(src);
    const origBytes = origStat.size;

    // Read into a buffer so we can safely write back to the same path.
    const inputBuffer = fs.readFileSync(src);
    const meta = await sharp(inputBuffer).metadata();

    const ext = path.extname(file).toLowerCase();
    const isPNG = ext === '.png';
    // Target output filename: PNG photos become .jpg
    const outFile = isPNG ? file.replace(/\.png$/i, '.jpg') : file;
    const dst = path.join(SRC_DIR, outFile);

    const pipeline = sharp(inputBuffer)
        .resize({
            width: MAX_WIDTH,
            withoutEnlargement: true,  // never upsize small images
            fit: 'inside'
        })
        .rotate()           // honour EXIF orientation, then strip
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true });

    const outputBuffer = await pipeline.toBuffer();

    // If we're renaming PNG → JPG, delete the original PNG after the JPG lands
    if (isPNG && dst !== src) {
        fs.writeFileSync(dst, outputBuffer);
        fs.unlinkSync(src);
    } else {
        fs.writeFileSync(dst, outputBuffer);
    }

    const newBytes = outputBuffer.length;
    const saved = origBytes - newBytes;
    const pct = origBytes > 0 ? ((saved / origBytes) * 100).toFixed(0) : 0;
    const renameNote = (isPNG && dst !== src) ? `  →  ${path.basename(dst)}` : '';

    console.log(
        `${file.padEnd(42)}` +
        `${humanSize(origBytes).padStart(10)}  →  ` +
        `${humanSize(newBytes).padStart(10)}  ` +
        `(-${pct}%)` +
        `  ${meta.width}×${meta.height}` +
        renameNote
    );
    return { origBytes, newBytes, renamed: isPNG && dst !== src ? { from: file, to: path.basename(dst) } : null };
}

(async function () {
    if (!fs.existsSync(SRC_DIR)) {
        console.error('Folder not found:', SRC_DIR);
        process.exit(1);
    }

    const files = fs.readdirSync(SRC_DIR)
        .filter(f => /\.(jpe?g|png)$/i.test(f))
        .sort();

    if (!files.length) {
        console.log('No images to compress in', SRC_DIR);
        return;
    }

    console.log(`\nCompressing ${files.length} files in images/life-at-avana/`);
    console.log(`Target: max width ${MAX_WIDTH}px, JPEG q=${JPEG_QUALITY}, strip EXIF\n`);
    console.log('FILE'.padEnd(42) + 'BEFORE'.padStart(10) + '         AFTER'.padStart(10) + '   SAVED  SOURCE DIMS\n');

    let totalBefore = 0, totalAfter = 0;
    const renamed = [];

    for (const f of files) {
        try {
            const r = await compress(f);
            totalBefore += r.origBytes;
            totalAfter  += r.newBytes;
            if (r.renamed) renamed.push(r.renamed);
        } catch (e) {
            console.error(`  ✗ ${f}: ${e.message}`);
        }
    }

    console.log('\n' + '-'.repeat(80));
    console.log(`TOTAL  ${humanSize(totalBefore).padStart(40)}  →  ${humanSize(totalAfter).padStart(10)}  (-${(((totalBefore-totalAfter)/totalBefore)*100).toFixed(1)}%)`);

    if (renamed.length) {
        console.log('\nRenamed (PNG → JPG):');
        renamed.forEach(r => console.log(`  ${r.from}  →  ${r.to}`));
        console.log('\n⚠  Update data/about.json photoCarousel image paths to use the new .jpg extensions.');
    }
})();
