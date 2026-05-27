import { spawn } from 'child_process';
import { Executor, ExecutionResult } from './base';

export class JavaScriptExecutor implements Executor {
  async run(code: string, timeoutMs: number): Promise<ExecutionResult> {
    const start = Date.now();

    return new Promise((resolve) => {
      const child = spawn('node', ['--eval', code], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        resolve({
          status: 'timeout',
          output: '',
          error: `Execution timed out after ${timeoutMs / 1000} seconds`,
          execution_time_ms: timeoutMs,
        });
      }, timeoutMs);

      child.on('close', (exitCode) => {
        clearTimeout(timer);
        const execution_time_ms = Date.now() - start;

        if (exitCode === 0) {
          resolve({ status: 'success', output: stdout.trim(), execution_time_ms });
        } else {
          resolve({ status: 'error', output: '', error: stderr.trim() || 'Process exited with non-zero status code', execution_time_ms });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          status: 'error',
          output: '',
          error: err.message,
          execution_time_ms: Date.now() - start
        });
      });
    });
  }
}
