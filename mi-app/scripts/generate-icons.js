const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table & function for standard PNG chunk generation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcVal = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function generatePNG(width, height) {
  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with scanlines
  // Indigo background #4f46e5 -> R:79, G:70, B:229, A:255
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const bgR = 79, bgG = 70, bgB = 229, bgA = 255;
  const fgR = 255, fgG = 255, fgB = 255, fgA = 255;

  // Center 'A' emblem radius & position
  const cx = width / 2;
  const cy = height / 2;
  const size = width * 0.35;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Calculate distance for rounded icon background & center letter "A" shape
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Simple elegant rounded badge with letter "A" geometry
      const isCornerRadius = (x < width * 0.1 || x > width * 0.9) && (y < height * 0.1 || y > height * 0.9);
      
      // Draw "A" letter strokes
      const relX = (x - cx) / size;
      const relY = (y - cy) / size;

      const inLeftLeg = relY >= -0.7 && relY <= 0.7 && Math.abs(relX - (-0.4 - relY * -0.3)) < 0.14;
      const inRightLeg = relY >= -0.7 && relY <= 0.7 && Math.abs(relX - (0.4 + relY * -0.3)) < 0.14;
      const inCrossbar = relY >= 0.0 && relY <= 0.25 && Math.abs(relX) <= 0.35;
      const isEmblem = inLeftLeg || inRightLeg || inCrossbar;

      if (isEmblem) {
        rawData[pxOffset] = fgR;
        rawData[pxOffset + 1] = fgG;
        rawData[pxOffset + 2] = fgB;
        rawData[pxOffset + 3] = fgA;
      } else {
        rawData[pxOffset] = bgR;
        rawData[pxOffset + 1] = bgG;
        rawData[pxOffset + 2] = bgB;
        rawData[pxOffset + 3] = bgA;
      }
    }
  }

  // IDAT Chunk (Deflate compressed)
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.join(__dirname, '..', 'public');

console.log('Generando imágenes PWA...');

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192));
console.log('✓ Creado pwa-192x192.png');

fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512));
console.log('✓ Creado pwa-512x512.png');

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180));
console.log('✓ Creado apple-touch-icon.png');

fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePNG(64, 64));
console.log('✓ Creado favicon.ico');

// Maskable SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#4f46e5" rx="100"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="280" fill="#ffffff">A</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'masked-icon.svg'), svgContent);
console.log('✓ Creado masked-icon.svg');

console.log('¡Todas las imágenes PWA han sido generadas con éxito!');
