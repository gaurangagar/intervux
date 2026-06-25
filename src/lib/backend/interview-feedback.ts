import { z } from "zod";
import { llm } from "@/src/lib/backend/llm";
import { FeedbackSchema } from "./Schemas/feedback-schema";

const feedbackModel = llm.withStructuredOutput(
  FeedbackSchema
);

type ConversationMessage = {
  role: string;
  content: string;
};

interface GenerateFeedbackParams {
  role: string;
  experience: number;
  conversation: ConversationMessage[];
}

export async function generateInterviewFeedback({
  role,
  experience,
  conversation,
}: GenerateFeedbackParams) {
  const conversationText = conversation
    .map(
      (message) =>
        `${message.role.toUpperCase()}: ${message.content}`
    )
    .join("\n");

  return await feedbackModel.invoke(`
Evaluate the following mock interview.

Role: ${role}
Experience: ${experience} years

Conversation:
${conversationText}

Evaluate:

1. Technical skills
2. Communication
3. Confidence
4. Problem solving
5. Overall performance

Provide constructive feedback.
`);
}