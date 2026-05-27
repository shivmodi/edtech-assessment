import { pool } from './client';

export const jobRepository = {
  async create(data: { user_id: string; language: string; code: string }) {
    const result = await pool.query(
      `INSERT INTO execution_jobs (user_id, language, code, status)
       VALUES ($1, $2, $3, 'queued') RETURNING *`,
      [data.user_id, data.language, data.code]
    );
    return result.rows[0];
  },

  async updateStatus(id: string, status: string) {
    await pool.query(
      `UPDATE execution_jobs SET status=$1 WHERE id=$2`,
      [status, id]
    );
  },

  async saveResult(id: string, result: {
    status: string; output: string; error?: string; execution_time_ms: number
  }) {
    await pool.query(
      `UPDATE execution_jobs 
       SET status=$1, output=$2, error=$3, execution_time_ms=$4, completed_at=NOW()
       WHERE id=$5`,
      [result.status, result.output, result.error || null, result.execution_time_ms, id]
    );
  },

  async findById(id: string) {
    const result = await pool.query(
      `SELECT * FROM execution_jobs WHERE id=$1`, [id]
    );
    return result.rows[0];
  }
};
