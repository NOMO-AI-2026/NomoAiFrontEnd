// Generates simple placeholder avatar PNGs (flat-color face icons) for the
// therapy session runner, entirely offline (no external APIs / no paid services).
// Run with: node scripts/generateAvatarPlaceholders.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'src', 'assets', 'avatar');
const SIZE = 400;
const INK = [30, 27, 75]; // matches app's #1E1B4B dark navy

function buildCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}
const CRC_TABLE = buildCrcTable();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, pixelAt) {
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelAt(x, y);
      const offset = rowStart + 1 + x * 3;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

// mouth "shape" functions return true when (x, y) should be inked as mouth
const MOUTHS = {
  neutral: (x, y, cx, my) => Math.abs(y - my) < 6 && Math.abs(x - cx) < 55,
  open: (x, y, cx, my) => dist(x, y, cx, my + 14) < 32,
  small_o: (x, y, cx, my) => dist(x, y, cx, my) < 15,
  wave: (x, y, cx, my) => {
    const wave = Math.sin((x - cx) / 9) * 7;
    return Math.abs(y - (my + wave)) < 6 && Math.abs(x - cx) < 48;
  },
  smile: (x, y, cx, my) => {
    // "cup" curve: corners turn up (smaller y), middle dips down (larger y)
    const curve = ((x - cx) / 70) ** 2 * 22;
    return Math.abs(y - (my - curve + 12)) < 7 && Math.abs(x - cx) < 68;
  },
  big_smile: (x, y, cx, my) => {
    const curve = ((x - cx) / 58) ** 2 * 28;
    return Math.abs(y - (my - curve + 16)) < 9 && Math.abs(x - cx) < 64;
  },
};

const STATES = [
  { name: 'idle', bg: '#60A5FA', mouth: 'neutral', earMark: false },
  { name: 'speaking', bg: '#34D399', mouth: 'open', earMark: false },
  { name: 'listening', bg: '#A78BFA', mouth: 'small_o', earMark: true },
  { name: 'thinking', bg: '#FBBF24', mouth: 'wave', earMark: false, thoughtDot: true },
  { name: 'happy', bg: '#F472B6', mouth: 'big_smile', earMark: false },
  { name: 'encouraging', bg: '#2DD4BF', mouth: 'smile', earMark: false, sparkle: true },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const state of STATES) {
  const bg = hexToRgb(state.bg);
  const face = mix(bg, [255, 255, 255], 0.35);
  const cx = SIZE / 2;
  const cy = SIZE / 2 - 10;
  const faceR = 150;
  const eyeOffsetX = 52;
  const eyeY = cy - 35;
  const eyeR = 17;
  const mouthY = cy + 55;
  const mouthFn = MOUTHS[state.mouth];

  const buf = encodePng(SIZE, SIZE, (x, y) => {
    const border = 14;
    if (x < border || x >= SIZE - border || y < border || y >= SIZE - border) {
      return INK;
    }

    let color = bg;

    if (dist(x, y, cx, cy) < faceR) {
      color = face;
    }

    // ears / listening marker: two small side discs
    if (state.earMark) {
      if (dist(x, y, cx - faceR + 10, cy) < 22 || dist(x, y, cx + faceR - 10, cy) < 22) {
        color = face;
      }
    }

    // thought bubble dots (thinking state)
    if (state.thoughtDot) {
      if (dist(x, y, cx + 95, cy - 120) < 14) color = face;
      if (dist(x, y, cx + 120, cy - 150) < 9) color = face;
      if (dist(x, y, cx + 138, cy - 172) < 6) color = face;
    }

    // sparkle marks (encouraging state)
    if (state.sparkle) {
      if (dist(x, y, cx - 120, cy - 110) < 8) color = [255, 224, 102];
      if (dist(x, y, cx + 128, cy - 95) < 6) color = [255, 224, 102];
    }

    // eyes
    if (dist(x, y, cx - eyeOffsetX, eyeY) < eyeR || dist(x, y, cx + eyeOffsetX, eyeY) < eyeR) {
      color = INK;
    }

    // mouth
    if (mouthFn(x, y, cx, mouthY)) {
      color = INK;
    }

    return color;
  });

  fs.writeFileSync(path.join(OUT_DIR, `${state.name}.png`), buf);
  console.log(`wrote ${state.name}.png`);
}
