import { spawn } from 'child_process';
import { Executor, ExecutionResult } from './base';

export class PythonExecutor implements Executor {
  async run(code: string, timeoutMs: number): Promise<ExecutionResult> {
    const start = Date.now();

    return new Promise((resolve) => {

      // Windows-friendly python command
      const child = spawn('python', ['-c', code], {
        shell: true,
      });

      let stdout = '';
      let stderr = '';
      let resolved = false;

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;

          // Windows-safe terminate
          child.kill();

          resolve({
            status: 'timeout',
            output: '',
            error: 'Execution timed out after 5 seconds',
            execution_time_ms: timeoutMs,
          });
        }
      }, timeoutMs);

      child.on('close', (code) => {
        if (resolved) return;

        resolved = true;
        clearTimeout(timer);

        const execution_time_ms = Date.now() - start;

        if (code === 0) {
          resolve({
            status: 'success',
            output: stdout.trim(),
            execution_time_ms,
          });
        } else {
          resolve({
            status: 'error',
            output: '',
            error: stderr.trim(),
            execution_time_ms,
          });
        }
      });

      child.on('error', (err) => {
        if (resolved) return;

        resolved = true;
        clearTimeout(timer);

        resolve({
          status: 'error',
          output: '',
          error: err.message,
          execution_time_ms: Date.now() - start,
        });
      });
    });
  }
}