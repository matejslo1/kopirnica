// Skupna povezava na Neon (HTTP serverless driver — primeren za Vercel funkcije)
import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);
