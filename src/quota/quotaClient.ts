import http from 'http';
import https from 'https';
import { ModelQuotaSnapshot } from './quotaTypes';
import { LanguageServerDiscovery } from './languageServerDiscovery';

export class QuotaClient {
  private lastSnapshot: ModelQuotaSnapshot | null = null;

  public async fetchQuotaSnapshot(): Promise<ModelQuotaSnapshot> {
    const conn = LanguageServerDiscovery.discover();

    if (!conn) {
      if (this.lastSnapshot) {
        return { ...this.lastSnapshot, isAvailable: false, errorMessage: 'Language Server disconnected' };
      }
      return {
        gemini: { weeklyPercent: 0, fiveHourPercent: 0 },
        claudeGpt: { weeklyPercent: 0, fiveHourPercent: 0 },
        fetchedAt: new Date(),
        isAvailable: false,
        errorMessage: 'Language Server process not found'
      };
    }

    const ports = Array.from(new Set([
      ...(conn.extensionPort ? [conn.extensionPort] : []),
      ...conn.listeningPorts
    ]));

    for (const port of ports) {
      for (const isHttps of [false, true]) {
        try {
          const buf = await this.queryPort(isHttps, port, conn.csrfToken);
          if (buf && buf.length > 0) {
            const snapshot = this.parseQuotaProtobufResponse(buf);
            this.lastSnapshot = snapshot;
            return snapshot;
          }
        } catch (e) {}
      }
    }

    if (this.lastSnapshot) {
      return { ...this.lastSnapshot, fetchedAt: new Date() };
    }

    return {
      gemini: { weeklyPercent: 0, fiveHourPercent: 0 },
      claudeGpt: { weeklyPercent: 0, fiveHourPercent: 0 },
      fetchedAt: new Date(),
      isAvailable: false,
      errorMessage: 'Failed to fetch quota from server'
    };
  }

  private queryPort(isHttps: boolean, port: number, csrfToken: string): Promise<Buffer | null> {
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

  private parseSectionQuota(buf: Buffer, sectionId: string, nextSectionId?: string): { percentage: number; resetText?: string } {
    const idx = buf.indexOf(sectionId);
    if (idx === -1) {
      return { percentage: 100 };
    }

    const endIdx = nextSectionId ? buf.indexOf(nextSectionId, idx) : -1;
    const sub = endIdx !== -1 ? buf.subarray(idx, endIdx) : buf.subarray(idx, Math.min(buf.length, idx + 250));
    const subStr = sub.toString('utf8');

    // 1. Extract Reset Text
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

    // 2. Check if this specific limit is hit (0%)
    if (subStr.includes('hit your weekly limit') || (subStr.includes('hit your 5-hour limit') && !subStr.includes('does not currently apply'))) {
      return { percentage: 0, resetText };
    }

    // 3. Extract IEEE 754 Float from binary payload (0.0 to 1.0)
    let percentage = 100;
    for (let i = 0; i <= sub.length - 4; i++) {
      const flt = sub.readFloatLE(i);
      if (!isNaN(flt) && flt >= 0.001 && flt <= 0.999) {
        percentage = Math.round(flt * 100);
        break;
      }
    }

    return { percentage, resetText };
  }

  private parseQuotaProtobufResponse(buf: Buffer): ModelQuotaSnapshot {
    const geminiWeekly = this.parseSectionQuota(buf, 'gemini-weekly', 'gemini-5h');
    const gemini5h = this.parseSectionQuota(buf, 'gemini-5h', '3p-weekly');
    const claudeWeekly = this.parseSectionQuota(buf, '3p-weekly', '3p-5h');
    const claude5h = this.parseSectionQuota(buf, '3p-5h', 'Claude and GPT models');

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
}
