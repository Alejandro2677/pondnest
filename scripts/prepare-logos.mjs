import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = 'public/logo/Logotipo minimalista PondNest en blanco y negro.png';
const output = path.join(root, 'public/logo/exports');
await fs.mkdir(output, { recursive: true });
const { data, info } = await sharp(path.join(root, source)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const rgba = Buffer.alloc(info.width * info.height * 4);
// Remove the black matte without tracing or regenerating any lettering.
// White foreground + original luminance as alpha preserves its antialiasing.
for (let i = 0; i < info.width * info.height; i++) {
  const luminance = Math.max(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
  rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = 255;
  rgba[i * 4 + 3] = luminance < 12 ? 0 : luminance;
}
const raw = { width: info.width, height: info.height, channels: 4 };
const rows = [];
for (let y = 0; y < info.height; y++) {
  let count = 0;
  for (let x = 0; x < info.width; x++) if (rgba[(y * info.width + x) * 4 + 3] > 128) count++;
  if (count > 10) rows.push(y);
}
const bands = [];
for (const y of rows) {
  if (!bands.length || y - bands.at(-1).bottom > 16) bands.push({ top: y, bottom: y });
  else bands.at(-1).bottom = y;
}
if (bands.length !== 2) throw new Error('The canonical original must contain one monogram and one wordmark. Inspect source before extracting.');
function bounds(top, bottom) {
  let left = info.width, right = 0, first = info.height, last = 0;
  for (let y = Math.max(0, top - 3); y <= Math.min(info.height - 1, bottom + 3); y++) for (let x = 0; x < info.width; x++) {
    if (rgba[(y * info.width + x) * 4 + 3] > 24) { left = Math.min(left, x); right = Math.max(right, x); first = Math.min(first, y); last = Math.max(last, y); }
  }
  left = Math.max(0, left - 2); right = Math.min(info.width - 1, right + 2);
  first = Math.max(0, first - 2); last = Math.min(info.height - 1, last + 2);
  return { left, top: first, width: right - left + 1, height: last - first + 1 };
}
const monogramBox = bounds(bands[0].top, bands[0].bottom);
const wordmarkBox = bounds(bands[1].top, bands[1].bottom);
const principalBox = { left: Math.min(monogramBox.left, wordmarkBox.left), top: monogramBox.top,
  width: Math.max(monogramBox.left + monogramBox.width, wordmarkBox.left + wordmarkBox.width) - Math.min(monogramBox.left, wordmarkBox.left),
  height: wordmarkBox.top + wordmarkBox.height - monogramBox.top };
const extract = box => sharp(rgba, { raw }).extract(box).png().toBuffer();
const monogram = await extract(monogramBox), wordmark = await extract(wordmarkBox);
const principal = await extract(principalBox);
const iconHeight = 256, typeHeight = 128, gap = 48;
const symbol = await sharp(monogram).resize({ height: iconHeight }).png().toBuffer();
const type = await sharp(wordmark).resize({ height: typeHeight }).png().toBuffer();
const symbolMeta = await sharp(symbol).metadata(), typeMeta = await sharp(type).metadata();
const horizontal = await sharp({ create: { width: symbolMeta.width + gap + typeMeta.width, height: iconHeight, channels: 4, background: '#00000000' } })
  .composite([{ input: symbol, left: 0, top: 0 }, { input: type, left: symbolMeta.width + gap, top: (iconHeight - typeHeight) / 2 }]).png().toBuffer();
const square = (size, background, padding) => sharp(monogram).resize({ width: size - padding * 2, height: size - padding * 2, fit: 'contain', background: '#00000000' })
  .extend({ top: padding, bottom: padding, left: padding, right: padding, background }).flatten({ background }).png().toBuffer();
const icon = await sharp(monogram).resize({ width: 512, height: 512, fit: 'contain', background: '#00000000' }).png().toBuffer();
const light = await sharp(horizontal).negate({ alpha: false }).png().toBuffer();
const avatar = await square(512, '#090a0d', 78);
const assets = {};
async function save(name, buffer, responsive = false) {
  const metadata = await sharp(buffer).metadata();
  await fs.writeFile(path.join(output, `${name}.png`), buffer);
  await sharp(buffer).webp({ lossless: true, effort: 6 }).toFile(path.join(output, `${name}.webp`));
  const variants = [];
  if (responsive) for (const width of [320, 640].filter(w => w < metadata.width)) {
    await sharp(buffer).resize({ width }).webp({ lossless: true, effort: 6 }).toFile(path.join(output, `${name}-${width}.webp`));
    variants.push({ src: `logo/exports/${name}-${width}.webp`, width });
  }
  assets[name] = { src: `logo/exports/${name}.webp`, png: `logo/exports/${name}.png`, width: metadata.width, height: metadata.height, variants };
}
await save('pondnest-principal', principal, true);
await save('pondnest-horizontal', horizontal, true);
await save('pondnest-icono', icon);
await save('pondnest-fondo-claro', light, true);
await save('pondnest-avatar', avatar);
const icoImages = [];
for (const size of [16, 32, 48, 180, 192, 512]) {
  const buffer = await square(size, '#090a0d', Math.max(1, Math.round(size * .10)));
  await fs.writeFile(path.join(output, `favicon-${size}.png`), buffer);
  if (size <= 48) icoImages.push({ size, buffer });
}
const icoHeader = Buffer.alloc(6 + icoImages.length * 16);
icoHeader.writeUInt16LE(1, 2); icoHeader.writeUInt16LE(icoImages.length, 4);
let offset = icoHeader.length;
icoImages.forEach(({ size, buffer }, i) => {
  const entry = 6 + i * 16;
  icoHeader[entry] = icoHeader[entry + 1] = size;
  icoHeader.writeUInt16LE(1, entry + 4); icoHeader.writeUInt16LE(32, entry + 6);
  icoHeader.writeUInt32LE(buffer.length, entry + 8); icoHeader.writeUInt32LE(offset, entry + 12); offset += buffer.length;
});
await fs.writeFile(path.join(output, 'favicon.ico'), Buffer.concat([icoHeader, ...icoImages.map(i => i.buffer)]));
await fs.writeFile(path.join(root, 'src/data/brand-assets.generated.json'), JSON.stringify(assets, null, 2) + '\n');
await fs.writeFile(path.join(output, 'provenance.json'), JSON.stringify({ source, monogramBox, wordmarkBox, principalBox, method: 'Original raster extraction; black matte removed; original glyphs retained. Horizontal layout reuses the two extracted pieces.' }, null, 2) + '\n');
console.log(JSON.stringify({ source, monogramBox, wordmarkBox, assets }, null, 2));
