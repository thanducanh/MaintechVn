import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';

// Kích hoạt đọc biến môi trường từ file .env
config();

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL,
  },
});