import { execSync } from 'child_process';

export interface LanguageServerConnection {
  pid: number;
  csrfToken: string;
  extensionPort?: number;
  listeningPorts: number[];
}

export class LanguageServerDiscovery {
  public static discover(): LanguageServerConnection | null {
    try {
      const wmicOut = execSync('wmic process where "name like \'%language_server%\'" get processid,commandline /format:csv', { encoding: 'utf-8' });
      const lines = wmicOut.split(/\r?\n/).filter(line => line.trim() && !line.startsWith('Node,CommandLine'));
      
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length < 3) continue;
        
        const pidStr = parts[parts.length - 1].trim();
        const pid = parseInt(pidStr, 10);
        const commandLine = parts.slice(1, parts.length - 1).join(',');

        if (!pid || isNaN(pid)) continue;

        const csrfMatch = commandLine.match(/--csrf_token\s+([a-f0-9\-]+)/i);
        const csrfToken = csrfMatch ? csrfMatch[1] : undefined;

        if (!csrfToken) continue;

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

        return {
          pid,
          csrfToken,
          extensionPort,
          listeningPorts
        };
      }
    } catch (e) {
      // Fallback or error logging
    }
    return null;
  }
}
