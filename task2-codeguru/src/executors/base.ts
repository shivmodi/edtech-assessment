export interface ExecutionResult {
  status: 'success' | 'error' | 'timeout';
  output: string;
  error?: string;
  execution_time_ms: number;
}

export interface Executor {
  run(code: string, timeoutMs: number): Promise<ExecutionResult>;
}
