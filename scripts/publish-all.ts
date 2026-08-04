import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function parseEnvFile(envPath: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return result;

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      result[key] = val;
    }
  }
  return result;
}

async function main() {
  const envPath = path.join(process.cwd(), '.env');
  const envVars = parseEnvFile(envPath);

  const ovsxToken = envVars['OVSX_ACCESS_TOKEN'] || process.env.OVSX_ACCESS_TOKEN;
  const vscodePat = envVars['VSCODE_MARKETPLACE_PAT'] || process.env.VSCODE_MARKETPLACE_PAT;

  console.log('==================================================');
  console.log('  Antigravity Quota Bar - Marketplace Publisher');
  console.log('==================================================\n');

  if (ovsxToken) {
    console.log('🚀 Publishing to Open VSX Registry...');
    try {
      execSync(`npx ovsx publish -p "${ovsxToken}"`, { stdio: 'inherit' });
      console.log('✅ Open VSX Publish Success!\n');
    } catch (e: any) {
      console.error('❌ Open VSX Publish Failed:', e.message || e);
    }
  } else {
    console.log('⚠️ OVSX_ACCESS_TOKEN not found in .env file. Skipping Open VSX publish.\n');
  }

  if (vscodePat) {
    console.log('🚀 Publishing to VS Code Marketplace...');
    try {
      execSync(`npx @vscode/vsce publish -p "${vscodePat}"`, { stdio: 'inherit' });
      console.log('✅ VS Code Marketplace Publish Success!\n');
    } catch (e: any) {
      console.error('❌ VS Code Marketplace Publish Failed:', e.message || e);
    }
  } else {
    console.log('⚠️ VSCODE_MARKETPLACE_PAT not found in .env file. Skipping VS Code Marketplace publish.\n');
  }
}

main();
