import { execSync } from 'child_process';
import http from 'http';
import https from 'https';

export interface QuotaMetric {
  weeklyPercent: number;
  weeklyResetText?: string;
  fiveHourPercent: number;
  fiveHourResetText?: string;
}

export interface ModelQuotaSnapshot {
  gemini: QuotaMetric;
  claudeGpt: QuotaMetric;
  fetchedAt: Date;
  isAvailable: boolean;
  errorMessage?: string;
}

function findLanguageServer(): { pid: number; csrfToken: string; extensionPort?: number; listeningPorts: number[] } | null {
  try {
    const tasklistOut = execSync('tasklist /FI "IMAGENAME eq language_server_windows_x64.exe" /FO CSV /NH', { encoding: 'utf-8' }).trim();
    if (!tasklistOut || tasklistOut.includes('No tasks')) return null;

    const lines = tasklistOut.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const parts = line.split('","').map(p => p.replace(/"/g, ''));
      if (parts.length < 2) continue;
      const pid = parseInt(parts[1], 10);
      if (!pid) continue;

      let commandLine = '';
      try {
        commandLine = execSync(`powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter 'ProcessId = ${pid}').CommandLine"`, { encoding: 'utf-8' }).trim();
      } catch (e) {}

      const csrfMatch = commandLine.match(/--csrf_token\s+([a-f0-9\-]+)/i);
      const csrfToken = csrfMatch ? csrfMatch[1] : undefined;
      if (!csrfToken) continue;

      const extPortMatch = commandLine.match(/--extension_server_port\s+(\d+)/i);
      const extensionPort = extPortMatch ? parseInt(extPortMatch[1], 10) : undefined;

      let listeningPorts: number[] = [];
      try {
        const netOut = execSync(`powershell -NoProfile -Command "(Get-NetTCPConnection -State Listen -OwningProcess ${pid} -ErrorAction SilentlyContinue).LocalPort"`, { encoding: 'utf-8' }).trim();
        if (netOut) {
          listeningPorts = netOut.split(/\r?\n/).map(p => parseInt(p.trim(), 10)).filter(Boolean);
        }
      } catch (e) {}

      return { pid, csrfToken, extensionPort, listeningPorts };
    }
  } catch (e) {}
  return null;
}

function fetchQuotaFromPort(isHttps: boolean, port: number, csrfToken: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const module = isHttps ? https : http;
    const path = '/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary';
    const frameHeader = Buffer.alloc(5);
    frameHeader.writeUInt8(0x00, 0);
    frameHeader.writeUInt32BE(0, 1);

    const req = module.request({
      hostname: '127.0.0.1',
      port: port,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/grpc-web+proto',
        'X-User-Agent': 'grpc-web-javascript/0.1',
        'x-codeium-csrf-token': csrfToken,
        'X-Codeium-Csrf-Token': csrfToken,
        'Content-Length': frameHeader.length
      },
      rejectUnauthorized: false,
      timeout: 3000
    }, (res) => {
      let chunks: Buffer[] = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(res.statusCode === 200 ? Buffer.concat(chunks) : null));
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });

    req.write(frameHeader);
    req.end();
  });
}

function parseSectionQuota(buf: Buffer, sectionId: string): { percentage: number; resetText?: string } {
  const idx = buf.indexOf(sectionId);
  if (idx === -1) {
    return { percentage: 100 };
  }

  const sub = buf.subarray(idx, Math.min(buf.length, idx + 350));
  const subStr = sub.toString('utf8');

  // Extract Reset Text
  let resetText: string | undefined = undefined;
  const resetMatch = subStr.match(/refresh in ([0-9]+ [a-z]+(?:, [0-9]+ [a-z]+)?)/i);
  if (resetMatch) {
    resetText = resetMatch[1]
      .replace(' days', 'd')
      .replace(' day', 'd')
      .replace(' hours', 'h')
      .replace(' hour', 'h')
      .replace(' minutes', 'm')
      .replace(' minute', 'm')
      .replace(/,\s*/g, ' ');
  }

  let percentage = 100;

  // 1. Try text percentage match (e.g. "%65" or "65%")
  const pctTextMatch = subStr.match(/%([0-9]{1,3})|([0-9]{1,3})%/);
  if (pctTextMatch) {
    const val = parseInt(pctTextMatch[1] || pctTextMatch[2], 10);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      percentage = val;
      return { percentage, resetText };
    }
  }

  // 2. Try binary IEEE 754 float
  for (let i = 0; i <= sub.length - 4; i++) {
    const flt = sub.readFloatLE(i);
    if (!isNaN(flt) && flt > 0.001 && flt < 0.999) {
      percentage = Math.round(flt * 100);
      break;
    }
  }

  return { percentage, resetText };
}

export function parseQuotaProtobufResponse(buf: Buffer): ModelQuotaSnapshot {
  const geminiWeekly = parseSectionQuota(buf, 'gemini-weekly');
  const gemini5h = parseSectionQuota(buf, 'gemini-5h');
  const claudeWeekly = parseSectionQuota(buf, '3p-weekly');
  const claude5h = parseSectionQuota(buf, '3p-5h');

  return {
    gemini: {
      weeklyPercent: geminiWeekly.percentage,
      weeklyResetText: geminiWeekly.resetText,
      fiveHourPercent: gemini5h.percentage,
      fiveHourResetText: gemini5h.resetText
    },
    claudeGpt: {
      weeklyPercent: claudeWeekly.percentage,
      weeklyResetText: claudeWeekly.resetText,
      fiveHourPercent: claude5h.percentage,
      fiveHourResetText: claude5h.resetText
    },
    fetchedAt: new Date(),
    isAvailable: true
  };
}

async function main() {
  console.log("==================================================");
  console.log(" Testing Live Percentage & Reset Extractor");
  console.log("==================================================");

  const conn = findLanguageServer();
  if (!conn) {
    console.log("Language Server not found!");
    return;
  }

  const ports = Array.from(new Set([...(conn.extensionPort ? [conn.extensionPort] : []), ...conn.listeningPorts]));

  for (const port of ports) {
    for (const isHttps of [false, true]) {
      const buf = await fetchQuotaFromPort(isHttps, port, conn.csrfToken);
      if (buf && buf.length > 0) {
        const snapshot = parseQuotaProtobufResponse(buf);
        console.log("\nPARSED LIVE QUOTA SNAPSHOT:");
        console.log(JSON.stringify(snapshot, null, 2));
        return;
      }
    }
  }
}

main();
