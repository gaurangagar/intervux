import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z.string().default("development"),

  JDOODLE_CLIENT_ID: z.string(),
  JDOODLE_CLIENT_SECRET: z.string(),

  GROQ_API_KEY:z.string(),
  
  STREAM_API_KEY:z.string(),
  STREAM_API_SECRET:z.string(),

  GMAIL_USER:z.email(),
  GMAIL_APP_PASSWORD:z.string(),

  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:z.string(),
  CLERK_SECRET_KEY:z.string(),

  CLERK_WEBHOOK_SECRET:z.string(),

  NEXT_PUBLIC_API_URL:z.string(),

  NEXT_PUBLIC_STREAM_API_KEY:z.string(),
});

export const env = envSchema.parse(process.env);