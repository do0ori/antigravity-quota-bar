import { execSync } from 'child_process';
import http from 'http';
import https from 'https';

interface ProcessInfo {
  pid: number;
  csrfToken?: string;
  extensionPort?: number;
  listeningPorts: number[];
}

async function findLanguageServer(): Promise<ProcessInfo[]> {
  try {
    const psCmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -like '*language_server*' } | Select-Object ProcessId, CommandLine | ConvertTo-Json"`;
    const stdout = execSync(psCmd, { encoding: 'utf-8' }).trim();
    if (!stdout) return [];
    
    const raw = JSON.parse(stdout);
    const procList = Array.isArray(raw) ? raw : [raw];
    const results: ProcessInfo[] = [];

    for (const p of procList) {
      const pid = p.ProcessId;
      const cmd = p.CommandLine || '';
      
      const csrfMatch = cmd.match(/--csrf_token\s+([a-f0-9\-]+)/i);
      const csrfToken = csrfMatch ? csrfMatch[1] : undefined;

      const extPortMatch = cmd.match(/--extension_server_port\s+(\d+)/i);
      const extensionPort = extPortMatch ? parseInt(extPortMatch[1], 10) : undefined;

      let listeningPorts: number[] = [];
      try {
        const netCmd = `powershell -NoProfile -Command "Get-NetTCPConnection -State Listen -OwningProcess ${pid} -ErrorAction SilentlyContinue | Select-Object LocalPort | ConvertTo-Json"`;
        const netOut = execSync(netCmd, { encoding: 'utf-8' }).trim();
        if (netOut) {
          const netParsed = JSON.parse(netOut);
          const portItems = Array.isArray(netParsed) ? netParsed : [netParsed];
          listeningPorts = portItems.map((item: any) => item.LocalPort).filter(Boolean);
        }
      } catch (e) {}

      results.push({ pid, csrfToken, extensionPort, listeningPorts });
    }
    return results;
  } catch (e) {
    return [];
  }
}

function fetchGrpcWeb(isHttps: boolean, port: number, path: string, token: string, requestPayload: Buffer): Promise<{ status?: number; data: Buffer; headers: any }> {
  return new Promise((resolve) => {
    const module = isHttps ? https : http;
    // Format 5-byte gRPC-Web Data Frame: [flags (1 byte), length (4 bytes BE)] + payload
    const frameHeader = Buffer.alloc(5);
    frameHeader.writeUInt8(0x00, 0); // 0x00 = Data frame
    frameHeader.writeUInt32BE(requestPayload.length, 1);
    const bodyBuf = Buffer.concat([frameHeader, requestPayload]);

    const req = module.request({
      hostname: '127.0.0.1',
      port: port,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/grpc-web+proto',
        'X-User-Agent': 'grpc-web-javascript/0.1',
        'x-csrf-token': token,
        'X-CSRF-Token': token,
        'Content-Length': bodyBuf.length
      },
      rejectUnauthorized: false,
      timeout: 3000
    }, (res) => {
      let chunks: Buffer[] = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, data: Buffer.concat(chunks), headers: res.headers }));
    });

    req.on('error', (err) => resolve({ status: undefined, data: Buffer.from(err.message), headers: {} }));
    req.on('timeout', () => { req.destroy(); resolve({ status: undefined, data: Buffer.alloc(0), headers: {} }); });

    req.write(bodyBuf);
    req.end();
  });
}

function parseGrpcWebFrames(buf: Buffer) {
  console.log(`\nParsing gRPC-Web Response Frame (${buf.length} bytes total)...`);
  let offset = 0;
  let frameCount = 0;

  while (offset < buf.length) {
    if (offset + 5 > buf.length) {
      console.log(`  [Offset ${offset}] Incomplete 5-byte header (${buf.length - offset} bytes remaining)`);
      break;
    }

    const flag = buf.readUInt8(offset);
    const length = buf.readUInt32BE(offset + 1);
    offset += 5;

    if (offset + length > buf.length) {
      console.log(`  [Offset ${offset}] Frame length ${length} exceeds remaining buffer (${buf.length - offset} bytes)`);
      break;
    }

    const frameData = buf.subarray(offset, offset + length);
    offset += length;
    frameCount++;

    const isTrailers = (flag & 0x80) !== 0;
    console.log(`\n--- Frame #${frameCount} (${isTrailers ? 'TRAILERS' : 'DATA'}, ${length} bytes) ---`);
    if (isTrailers) {
      console.log(frameData.toString('utf8'));
    } else {
      console.log(`Raw Hex: ${frameData.toString('hex')}`);
      console.log(`Raw Printable: ${frameData.toString('utf8').replace(/[^\x20-\x7E]/g, '.')}`);
      parseProtobufFields(frameData);
    }
  }
}

function parseProtobufFields(buf: Buffer, indent = '  ') {
  let offset = 0;
  while (offset < buf.length) {
    try {
      // Decode varint for key
      let key = 0;
      let shift = 0;
      let b = 0;
      do {
        if (offset >= buf.length) return;
        b = buf[offset++];
        key |= (b & 0x7f) << shift;
        shift += 7;
      } while (b & 0x80);

      const fieldNumber = key >> 3;
      const wireType = key & 0x07;

      if (wireType === 0) { // Varint
        let val = 0;
        let vShift = 0;
        let vb = 0;
        do {
          if (offset >= buf.length) return;
          vb = buf[offset++];
          val |= (vb & 0x7f) << vShift;
          vShift += 7;
        } while (vb & 0x80);
        console.log(`${indent}Field #${fieldNumber} [Varint]: ${val}`);
      } else if (wireType === 1) { // 64-bit
        if (offset + 8 > buf.length) return;
        const doubleVal = buf.readDoubleLE(offset);
        offset += 8;
        console.log(`${indent}Field #${fieldNumber} [64-bit / Double]: ${doubleVal}`);
      } else if (wireType === 2) { // Length-delimited (string / bytes / embedded message)
        let len = 0;
        let lShift = 0;
        let lb = 0;
        do {
          if (offset >= buf.length) return;
          lb = buf[offset++];
          len |= (lb & 0x7f) << lShift;
          lShift += 7;
        } while (lb & 0x80);

        if (offset + len > buf.length) return;
        const subBuf = buf.subarray(offset, offset + len);
        offset += len;

        const strVal = subBuf.toString('utf8').replace(/[^\x20-\x7E\r\n]/g, '');
        console.log(`${indent}Field #${fieldNumber} [Length-Delimited, ${len} bytes]:`);
        if (strVal.length > 3) {
          console.log(`${indent}  String preview: "${strVal}"`);
        }
        // Try recursive parsing as nested message
        parseProtobufFields(subBuf, indent + '  ');
      } else if (wireType === 5) { // 32-bit
        if (offset + 4 > buf.length) return;
        const floatVal = buf.readFloatLE(offset);
        offset += 4;
        console.log(`${indent}Field #${fieldNumber} [32-bit / Float]: ${floatVal}`);
      } else {
        console.log(`${indent}Unknown wire type ${wireType} at field #${fieldNumber}`);
        break;
      }
    } catch (e) {
      break;
    }
  }
}

async function main() {
  console.log("==================================================");
  console.log(" Antigravity gRPC-Web Quota Protobuf Extractor");
  console.log("==================================================");

  const procs = await findLanguageServer();
  for (const proc of procs) {
    if (!proc.csrfToken) continue;
    const ports = Array.from(new Set([...(proc.extensionPort ? [proc.extensionPort] : []), ...proc.listeningPorts]));

    for (const port of ports) {
      for (const isHttps of [false, true]) {
        console.log(`\nTesting ${isHttps ? 'HTTPS' : 'HTTP'}://127.0.0.1:${port}`);
        
        // 1. Try empty payload
        let res = await fetchGrpcWeb(isHttps, port, '/exa.language_server_pb.LanguageServerService/GetUserStatus', proc.csrfToken, Buffer.alloc(0));
        if (res.status === 200 && res.data.length > 0) {
          console.log(`\n🎉 RECEIVED ${res.data.length} BYTES FROM /GetUserStatus ON ${isHttps ? 'HTTPS' : 'HTTP'}:${port}`);
          parseGrpcWebFrames(res.data);
        }

        // 2. Try with metadata / client version field (Field 1 string "antigravity")
        const reqPayload = Buffer.from([0x0a, 0x0b, 0x61, 0x6e, 0x74, 0x69, 0x67, 0x72, 0x61, 0x76, 0x69, 0x74, 0x79]);
        res = await fetchGrpcWeb(isHttps, port, '/exa.language_server_pb.LanguageServerService/GetUserStatus', proc.csrfToken, reqPayload);
        if (res.status === 200 && res.data.length > 0) {
          console.log(`\n🎉 RECEIVED ${res.data.length} BYTES WITH REQ PAYLOAD ON ${isHttps ? 'HTTPS' : 'HTTP'}:${port}`);
          parseGrpcWebFrames(res.data);
        }
      }
    }
  }

  console.log("\n==================================================");
  console.log(" Extractor probe finished.");
  console.log("==================================================");
}

main();
