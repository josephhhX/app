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

function generateJamiPNG(width, height) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  // Background Dark Teal #184a42
  const bgR = 24, bgG = 74, bgB = 66, bgA = 255;
  // White #ffffff
  const wR = 255, wG = 255, wB = 255, wA = 255;
  // Dark Teal for eyes/nose
  const dR = 20, dG = 60, dB = 54, dA = 255;

  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Normalized coordinates (-1 to 1)
      const nx = (x - cx) / (width * 0.46);
      const ny = (y - cy) / (height * 0.46);

      // Default background teal
      let r = bgR, g = bgG, b = bgB, a = bgA;

      // Cat Head Body: oval centered slightly lower
      const headDist = (nx * nx) / (0.75 * 0.75) + ((ny - 0.15) * (ny - 0.15)) / (0.55 * 0.55);

      // Left Ear: triangle between (-0.6, -0.1), (-0.45, -0.8), (-0.15, -0.3)
      const inLeftEar = (nx >= -0.65 && nx <= -0.15 && ny >= -0.85 && ny <= 0.0) &&
                        (ny >= -0.85 + (nx + 0.45) * 3.5) &&
                        (ny >= -0.85 - (nx + 0.45) * 2.8);

      // Right Ear: triangle symmetric
      const inRightEar = (nx >= 0.15 && nx <= 0.65 && ny >= -0.85 && ny <= 0.0) &&
                         (ny >= -0.85 - (nx - 0.45) * 3.5) &&
                         (ny >= -0.85 + (nx - 0.45) * 2.8);

      const inCatFace = headDist <= 1.0 || inLeftEar || inRightEar;

      if (inCatFace) {
        r = wR; g = wG; b = wB; a = wA;

        // Cat Eyes
        const leftEyeDist = ((nx + 0.26) * (nx + 0.26)) / (0.07 * 0.07) + ((ny - 0.08) * (ny - 0.08)) / (0.09 * 0.09);
        const rightEyeDist = ((nx - 0.26) * (nx - 0.26)) / (0.07 * 0.07) + ((ny - 0.08) * (ny - 0.08)) / (0.09 * 0.09);

        // Eye highlights
        const leftHigh = Math.hypot(nx + 0.24, ny - 0.05);
        const rightHigh = Math.hypot(nx - 0.28, ny - 0.05);

        if (leftHigh <= 0.03 || rightHigh <= 0.03) {
          r = wR; g = wG; b = wB;
        } else if (leftEyeDist <= 1.0 || rightEyeDist <= 1.0) {
          r = dR; g = dG; b = dB;
        }

        // Cat Nose: tiny inverted triangle around (0, 0.22)
        if (ny >= 0.19 && ny <= 0.26 && Math.abs(nx) <= (0.26 - ny) * 0.8) {
          r = dR; g = dG; b = dB;
        }

        // Cat Mouth: small curve around (0, 0.32)
        if (ny >= 0.29 && ny <= 0.33 && Math.abs(nx) <= 0.12) {
          const dy = ny - 0.31;
          if (Math.abs(dy - Math.abs(nx) * 0.2) <= 0.02) {
            r = dR; g = dG; b = dB;
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.join(__dirname, '..', 'public');

console.log('Generando iconos de Jami...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateJamiPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateJamiPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateJamiPNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generateJamiPNG(64, 64));
console.log('✓ ¡Iconos de Jami generados con éxito!');
