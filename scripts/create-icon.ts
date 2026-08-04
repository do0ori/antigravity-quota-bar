import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

function create128x128Png(filePath: string) {
  const width = 128;
  const height = 128;

  // Uncompressed RGBA image data (128x128 * 4 bytes + 1 filter byte per line)
  const rawData = Buffer.alloc(height * (width * 4 + 1));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // PNG filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - 64;
      const dy = y - 64;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background rounded square (#1E1E2E)
      let r = 0x1e, g = 0x1e, b = 0x2e, a = 0xff;

      // Progress Ring & Center Star
      if (dist >= 36 && dist <= 46) {
        // Emerald Green Circle Ring (#34D399)
        r = 0x34; g = 0xd3; b = 0x99;
      } else if (dist <= 18) {
        // Center Star Light Blue (#60A5FA)
        r = 0x60; g = 0xa5; b = 0xfa;
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // Compress IDAT chunk data using zlib
  const compressedData = zlib.deflateSync(rawData);

  // Helper CRC32 calculator
  function crc32(buf: Buffer): number {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc ^ byte) & 1 ? 0xedb88320 : 0);
        byte >>>= 1;
      }
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type: string, data: Buffer): Buffer {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);

    const crcValue = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcValue, 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);  // Bit depth
  ihdrData.writeUInt8(6, 9);  // Color type RGBA
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(filePath, pngBuffer);
  console.log(`PNG Icon created successfully at ${filePath}`);
}

create128x128Png(path.join(process.cwd(), 'images', 'icon.png'));
