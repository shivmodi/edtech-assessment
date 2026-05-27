import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3002,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://admin:admin123@localhost:5432/edtech',
};