import {
  beforeAll, describe, expect, it,
} from 'vitest';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';
import { createScriptCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/ScriptCompilerFactory';
import LinuxCollection from '@/application/collections/linux.yaml';
import MacOsCollection from '@/application/collections/macos.yaml';
import WindowsCollection from '@/application/collections/windows.yaml';
import type { CategoryData, ScriptData } from '@/application/collections/';
import type { Application } from '@/domain/Application/Application';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { BASE_APP_COMPILATION_TIMEOUT_MS } from '@tests/shared/TestTiming';

// These tests inspect generated text only. Never execute catalog commands here.
describe('Catalog command generation regressions', () => {
  let application: Application;

  beforeAll(() => {
    application = loadApplicationComposite();
  }, BASE_APP_COMPILATION_TIMEOUT_MS);

  it('uses the documented SMB1 server registry value on apply and revert', () => {
    const collection = application.getCollection(OperatingSystem.Windows);
    const { code } = collection.getScript('Disable insecure "SMBv1" protocol');

    [code.execute, code.revert ?? ''].forEach((text) => {
      expect(text).toContain("/v 'SMB1'");
      expect(text).not.toContain("/v 'SMBv1'");
    });
  });

  it('passes only the enumerated log name to the event-log clear command', () => {
    const collection = application.getCollection(OperatingSystem.Windows);
    const { code } = collection.getScript('Clear event logs in Event Viewer application');

    expect(code.execute).toContain('wevtutil.exe cl "%%i"');
    expect(code.execute).not.toContain('%1');
  });

  it('keeps evaluated registry data on one line for the shared helper comment boundary', () => {
    function checkNodes(nodes: readonly (CategoryData | ScriptData)[]): void {
      nodes.forEach((node) => {
        if ('children' in node) {
          checkNodes(node.children);
        } else if ('call' in node) {
          const calls = Array.isArray(node.call) ? node.call : [node.call];
          calls.forEach((call) => {
            if (call?.parameters?.evaluateDataAsPowerShell === 'true') {
              const { data, dataOnRevert } = call.parameters;
              [data, dataOnRevert].filter((value) => value !== undefined).forEach((value) => {
                expect(value, node.name).not.toMatch(/[\r\n]/);
              });
            }
          });
        }
      });
    }

    checkNodes(WindowsCollection.actions);
  });

  it('keeps database and recovery files out of diagnostic-trace cleanup', () => {
    const collection = application.getCollection(OperatingSystem.Windows);
    const { code } = collection.getScript('Clear "Cryptographic Services" diagnostic traces');

    expect(code.execute).toContain('catroot2\\dberr.txt');
    expect(code.execute).not.toMatch(/catroot2\.(?:edb|chk|jrs|log)/);
  });

  it.each([
    'Disable outdated Edge metrics data sending',
    'Disable outdated Edge site information sending',
  ])('does not recommend obsolete policy: %s', (name) => {
    const collection = application.getCollection(OperatingSystem.Windows);
    const script = collection.getScript(name);

    expect(script.level).toBeUndefined();
    expect(script.code.revert).toBeTruthy();
  });

  it('targets home-relative GNOME Web caches for native and Snap installations', () => {
    const collection = application.getCollection(OperatingSystem.Linux);
    const { code } = collection.getScript('Clear GNOME Web cache');

    expect(code.execute).toContain('"$HOME/.cache/epiphany/"*');
    expect(code.execute).toContain('"$HOME/snap/epiphany/common/.cache/"*');
    expect(code.execute).not.toContain('~/~/');
    expect(code.execute).not.toMatch(/\brm\s+-\w*\s+\/\.cache/);
  });

  it('enumerates root cache entries after elevation, not relative to the working directory', () => {
    const collection = application.getCollection(OperatingSystem.Linux);
    const { code } = collection.getScript('Clear user-specific cache');

    expect(code.execute).toContain('sudo find /root/.cache -mindepth 1 -maxdepth 1');
    expect(code.execute).toContain('-exec rm -rf -- {} +');
    expect(code.execute).not.toMatch(/\brm\s+-\w*\s+root\//);
  });

  it('initializes the cron target in a standalone revert', () => {
    const collection = application.getCollection(OperatingSystem.Linux);
    const { code } = collection.getScript('Remove daily cron entry for Popularity Contest (popcon)');
    const revert = code.revert ?? '';

    expect(revert).toContain("job_name='popularity-contest'");
    expect(revert.indexOf("job_name='popularity-contest'"))
      .toBeLessThan(revert.indexOf('cronjob_path='));
  });

  it.each([
    ['Clear Gradle cache', '$HOME/.gradle/caches'],
    ['Clear Dropbox cache', '$HOME/Dropbox/.dropbox.cache'],
  ])('expands the home directory in the %s guard', (name, path) => {
    const collection = application.getCollection(OperatingSystem.macOS);
    const { code } = collection.getScript(name);

    expect(code.execute).toContain(`[ -d "${path}" ]`);
    expect(code.execute).not.toContain('[ -d "~/');
  });

  it('preserves Homebrew cache paths containing spaces', () => {
    const collection = application.getCollection(OperatingSystem.macOS);
    const { code } = collection.getScript('Clear Homebrew cache');

    expect(code.execute).toContain('rm -rf -- "$(brew --cache)"');
  });

  it.each([false, true])('disables field splitting locally for macOS glob deletion (sudo=%s)', (elevated) => {
    const compiler = createScriptCompiler({
      categoryContext: {
        functions: MacOsCollection.functions ?? [],
        language: ScriptLanguage.shellscript,
      },
    });
    const code = compiler.compile({
      name: 'Directory with spaces',
      call: {
        function: 'ClearDirectoryContents',
        parameters: {
          directoryGlob: '$HOME/Library/Application Support/privacy.sexy/runs',
          ...(elevated ? { grantPermissions: 'true' } : {}),
        },
      },
    });

    expect(code.execute).toMatch(/\(\s*IFS=\s*\n/);
    expect(code.execute).toContain('rm -rf -- $glob_pattern');
    expect(code.execute.trim()).toMatch(/\)$/);
  });

  it('uses Firefox database helper arguments and commits before reporting deletion', () => {
    const compiler = createScriptCompiler({
      categoryContext: {
        functions: LinuxCollection.functions ?? [],
        language: ScriptLanguage.shellscript,
      },
    });
    const code = compiler.compile({
      name: 'Database cleanup generation',
      call: {
        function: 'CleanTableFromFirefoxProfileDatabase',
        parameters: {
          databaseFileName: 'cookies.sqlite',
          tableName: 'moz_cookies',
        },
      },
    });

    expect(code.execute).toMatch(/database_name\s*=\s*'cookies\.sqlite'/);
    expect(code.execute).toMatch(/table_name\s*=\s*'moz_cookies'/);
    expect(code.execute).toContain('conn.commit()');
    expect(code.execute).toContain('with closing(sqlite3.connect(file)) as conn:');
    expect(code.execute).toContain('deleted_row_count += cursor.rowcount');
    expect(code.execute.indexOf('conn.commit()'))
      .toBeLessThan(code.execute.indexOf('deleted_row_count += cursor.rowcount'));
    expect(code.execute).toContain('\n  except sqlite3.Error as e:\n    print(');
  });
});
