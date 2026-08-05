import { execSync } from 'child_process';
import * as os from 'os';

export interface LanguageServerConnection {
  pid: number;
  csrfToken: string;
  extensionPort?: number;
  listeningPorts: number[];
}

export class LanguageServerDiscovery {
  public static discover(): LanguageServerConnection | null {
    const isWindows = os.platform() === 'win32';
    if (isWindows) {
      return this.discoverWindows();
    } else {
      return this.discoverPosix();
    }
  }

  private static discoverWindows(): LanguageServerConnection | null {
    try {
      const tasklistOut = execSync('tasklist /FI "IMAGENAME eq language_server*" /FO CSV /NH', { encoding: 'utf-8' }).trim();
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

  private static discoverPosix(): LanguageServerConnection | null {
    try {
      const psOut = execSync('ps aux | grep language_server | grep -v grep', { encoding: 'utf-8' }).trim();
      if (!psOut) return null;

      const lines = psOut.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 2) continue;
        const pid = parseInt(parts[1], 10);
        if (!pid) continue;

        const csrfMatch = line.match(/--csrf_token\s+([a-f0-9\-]+)/i);
        const csrfToken = csrfMatch ? csrfMatch[1] : undefined;
        if (!csrfToken) continue;

        const extPortMatch = line.match(/--extension_server_port\s+(\d+)/i);
        const extensionPort = extPortMatch ? parseInt(extPortMatch[1], 10) : undefined;

        let listeningPorts: number[] = [];
        try {
          const lsofOut = execSync(`lsof -a -iTCP -sTCP:LISTEN -p ${pid} -Fn 2>/dev/null`, { encoding: 'utf-8' }).trim();
          if (lsofOut) {
            const portMatches = lsofOut.match(/:(\d+)/g);
            if (portMatches) {
              listeningPorts = portMatches.map(p => parseInt(p.replace(':', ''), 10)).filter(Boolean);
            }
          }
        } catch (e) {}

        return { pid, csrfToken, extensionPort, listeningPorts };
      }
    } catch (e) {}
    return null;
  }
}

