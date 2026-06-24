import { z } from "zod";
export const ResumeSchema = z.object({
  skills: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  experience: z.array(z.string()).default([]),
  education: z.array(z.string()).default([]),
});