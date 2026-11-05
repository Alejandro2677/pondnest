import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await fs.readFile(path.join(root, 'config/product-images.json')));
const cachePath = path.join(root, '.cache/product-images.json');
let cache = {};
try { cache = JSON.parse(await fs.readFile(cachePath)); } catch {}
const nextCache = {}, products = {};
let before = 0, after = 0, delivery = 0, processed = 0, skipped = 0;
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
for (const [handle, settings] of Object.entries(config.products)) {
  const dir = path.join(root, 'public/productos', settings.folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.mkdir(path.join(dir, '_optimized'), { recursive: true });
  const images = [];
  const names = (await fs.readdir(dir, { withFileTypes: true })).filter(e => e.isFile()).map(e => e.name).sort(compare);
  for (const name of names) {
    const input = path.join(dir, name);
    let metadata;
    try { metadata = await sharp(input).metadata(); } catch (error) {
      if (!path.extname(name) || /\.(jpe?g|png|webp|avif|tiff?|gif|heic)$/i.test(name)) throw new Error(`Imagen ilegible: ${input}`, { cause: error });
      continue;
    }
    if (!['jpeg', 'png', 'webp', 'avif', 'heif', 'tiff', 'gif'].includes(metadata.format)) continue;
    if ((metadata.pages || 1) > 1) throw new Error(`Imagen animada/multipágina no admitida: ${input}. Exporta una fotografía estática.`);
    const bytes = await fs.readFile(input);
    const digest = createHash('sha256').update(bytes).update(JSON.stringify(config)).update(sharp.versions.sharp).digest('hex');
    const key = `${settings.folder}/${name}`;
    let entry = cache[key];
    if (entry?.digest === digest && (await Promise.all(entry.files.map(f => fs.access(path.join(dir, f)).then(() => true, () => false)))).every(Boolean)) {
      skipped++;
    } else {
      const id = createHash('sha256').update(name).digest('hex').slice(0, 12);
      const stem = `${id}-${digest.slice(0, 16)}`;
      const pipeline = () => sharp(bytes).rotate().resize({ width: config.maxDimension, height: config.maxDimension, fit: 'inside', withoutEnlargement: true }).webp({ quality: config.quality, effort: 6 });
      let full = await pipeline().toBuffer();
      // Already optimized WebP can be copied byte-for-byte, avoiding lossy recompression.
      if (metadata.format === 'webp' && !metadata.orientation && metadata.width <= config.maxDimension && metadata.height <= config.maxDimension && bytes.length <= full.length) full = bytes;
      const fullMeta = await sharp(full).metadata();
      const variants = [], files = [];
      async function write(buffer, suffix) {
        const filename = `_optimized/${stem}-${suffix}.webp`;
        await fs.writeFile(path.join(dir, filename + '.tmp'), buffer);
        await sharp(await fs.readFile(path.join(dir, filename + '.tmp'))).stats();
        await fs.rename(path.join(dir, filename + '.tmp'), path.join(dir, filename));
        files.push(filename);
        return { src: `productos/${settings.folder}/${filename}`, bytes: buffer.length };
      }
      const main = await write(full, 'full');
      for (const width of config.widths.filter(w => w < fullMeta.width)) {
        const buffer = await sharp(full).resize({ width, withoutEnlargement: true }).webp({ quality: config.quality, effort: 6 }).toBuffer();
        variants.push({ ...await write(buffer, width), width });
      }
      entry = { digest, files, image: { source: name, ...main, width: fullMeta.width, height: fullMeta.height, variants } };
      processed++;
    }
    nextCache[key] = entry;
    before += bytes.length;
    after += entry.image.bytes;
    delivery += entry.image.bytes + entry.image.variants.reduce((sum, v) => sum + v.bytes, 0);
    images.push(entry.image);
  }
  // Explicit order wins; remaining files use a locale-independent filename order.
  const ordered = [...new Set([settings.primary, ...settings.order].filter(Boolean))];
  for (const name of ordered) if (!images.some(i => i.source === name || path.parse(i.source).name === name)) console.warn(`[${handle}] No se encuentra la imagen configurada: ${name}`);
  const rank = image => { const i = ordered.findIndex(n => n === image.source || n === path.parse(image.source).name); return i < 0 ? Infinity : i; };
  images.sort((a, b) => rank(a) - rank(b) || compare(a.source, b.source));
  products[handle] = images;
}
await fs.mkdir(path.dirname(cachePath), { recursive: true });
await fs.writeFile(cachePath, JSON.stringify(nextCache, null, 2));
const report = { originalBytes: before, optimizedBytes: after, responsiveBytes: delivery, savedPercent: before ? Number(((1 - after / before) * 100).toFixed(2)) : 0 };
await fs.writeFile(path.join(root, 'src/data/product-images.generated.json'), JSON.stringify({ products, report }, null, 2) + '\n');
console.log(JSON.stringify({ processed, skipped, ...report }, null, 2));
