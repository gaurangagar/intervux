import { z } from "zod";

export const FeedbackSchema = z.object({
  score: z.number().min(0).max(10),

  strengths: z.array(z.string()).default([]),

  weaknesses: z.array(z.string()).default([]),

  suggestions: z.array(z.string()).default([]),

  communication: z.string(),

  technicalKnowledge: z.string(),

  confidence: z.string(),

  problemSolving: z.string(),
});