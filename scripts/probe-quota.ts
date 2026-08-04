import { execSync } from 'child_process';
import http from 'http';
import https from 'https';

interface ProcessInfo {
  pid: number;
  csrfToken?: string;
  extensionPort?: number;
  listeningPorts: number[];
}

function findLanguageServer(): ProcessInfo[] {
  try {
    // Run wmic command directly
    const wmicOut = execSync('wmic process where "name like \'%language_server%\'" get processid,commandline /format:csv', { encoding: 'utf-8' });
    const lines = wmicOut.split(/\r?\n/).filter(line => line.trim() && !line.startsWith('Node,CommandLine'));
    const results: ProcessInfo[] = [];

    for (const line of lines) {
      const parts = line.split(',');
      if (parts.length < 3) continue;
      
      const pidStr = parts[parts.length - 1].trim();
      const pid = parseInt(pidStr, 10);
      const commandLine = parts.slice(1, parts.length - 1).join(',');

      if (!pid || isNaN(pid)) continue;

      const csrfMatch = commandLine.match(/--csrf_token\s+([a-f0-9\-]+)/i);
      const csrfToken = csrfMatch ? csrfMatch[1] : undefined;

      const extPortMatch = commandLine.match(/--extension_server_port\s+(\d+)/i);
      const extensionPort = extPortMatch ? parseInt(extPortMatch[1], 10) : undefined;

      let listeningPorts: number[] = [];
      try {
        const netCmd = `powershell -NoProfile -Command "Get-NetTCPConnection -State Listen -OwningProcess ${pid} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort"`;
        const netOut = execSync(netCmd, { encoding: 'utf-8' }).trim();
        if (netOut) {
          listeningPorts = netOut.split(/\r?\n/).map(p => parseInt(p.trim(), 10)).filter(Boolean);
        }
      } catch (e) {}

      console.log(`\nFound Language Server [PID ${pid}]:`);
      console.log(`  CSRF Token: ${csrfToken || 'None'}`);
      console.log(`  Extension Port: ${extensionPort || 'None'}`);
      console.log(`  Listening Ports: ${listeningPorts.join(', ') || 'None'}`);

      results.push({ pid, csrfToken, extensionPort, listeningPorts });
    }
    return results;
  } catch (e: any) {
    console.error("Error finding processes:", e.message);
    return [];
  }
}

function fetchGrpcWeb(isHttps: boolean, port: number, path: string, token: string, requestPayload: Buffer): Promise<{ status?: number; data: Buffer }> {
  return new Promise((resolve) => {
    const module = isHttps ? https : http;
    const frameHeader = Buffer.alloc(5);
    frameHeader.writeUInt8(0x00, 0);
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
      res.on('end', () => resolve({ status: res.statusCode, data: Buffer.concat(chunks) }));
    });

    req.on('error', () => resolve({ status: undefined, data: Buffer.alloc(0) }));
    req.on('timeout', () => { req.destroy(); resolve({ status: undefined, data: Buffer.alloc(0) }); });

    req.write(bodyBuf);
    req.end();
  });
}

function parseGrpcWebFrames(buf: Buffer) {
  let offset = 0;
  let frameCount = 0;

  while (offset < buf.length) {
    if (offset + 5 > buf.length) break;
    const flag = buf.readUInt8(offset);
    const length = buf.readUInt32BE(offset + 1);
    offset += 5;

    if (offset + length > buf.length) break;
    const frameData = buf.subarray(offset, offset + length);
    offset += length;
    frameCount++;

    const isTrailers = (flag & 0x80) !== 0;
    console.log(`\n  --- Frame #${frameCount} (${isTrailers ? 'TRAILERS' : 'DATA'}, ${length} bytes) ---`);
    if (isTrailers) {
      console.log('  ' + frameData.toString('utf8').replace(/\r?\n/g, '\n  '));
    } else {
      console.log(`  Raw Hex: ${frameData.toString('hex')}`);
      console.log(`  Printable: ${frameData.toString('utf8').replace(/[^\x20-\x7E]/g, '.')}`);
    }
  }
}

async function main() {
  console.log("==================================================");
  console.log(" Antigravity User Status & Quota Probe v5");
  console.log("==================================================");

  const procs = findLanguageServer();
  const endpoints = [
    '/exa.language_server_pb.LanguageServerService/GetUserStatus',
    '/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary',
  ];

  const testPayloads = [
    Buffer.alloc(0),
    Buffer.from([0x0a, 0x00]),
    Buffer.from([0x0a, 0x02, 0x08, 0x01]),
    Buffer.from([0x0a, 0x0e, 0x0a, 0x0c, 0x61, 0x6e, 0x74, 0x69, 0x67, 0x72, 0x61, 0x76, 0x69, 0x74, 0x79]),
  ];

  for (const proc of procs) {
    if (!proc.csrfToken) continue;
    const ports = Array.from(new Set([...(proc.extensionPort ? [proc.extensionPort] : []), ...proc.listeningPorts]));

    for (const port of ports) {
      for (const isHttps of [false, true]) {
        for (const ep of endpoints) {
          for (let i = 0; i < testPayloads.length; i++) {
            const res = await fetchGrpcWeb(isHttps, port, ep, proc.csrfToken, testPayloads[i]);
            if (res.status === 200 && res.data.length > 0) {
              console.log(`\n🎉 SUCCESS! Endpoint: ${ep} on ${isHttps ? 'HTTPS' : 'HTTP'}:${port} (Payload #${i}) -> Received ${res.data.length} bytes!`);
              parseGrpcWebFrames(res.data);
            }
          }
        }
      }
    }
  }

  console.log("\n==================================================");
  console.log(" Probe Finished.");
  console.log("==================================================");
}

main();
