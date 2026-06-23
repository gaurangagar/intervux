import { llm } from "@/lib/llm";

type ConversationMessage = {
  role: string;
  content: string;
};

interface GenerateQuestionParams {
  interviewerName?: string | null;
  role: string;
  experience: number;
  interviewType: string;
  resumeData?: unknown;
  conversation?: ConversationMessage[];
}

export async function generateInterviewQuestion({
  interviewerName,
  role,
  experience,
  interviewType,
  resumeData,
  conversation = [],
}: GenerateQuestionParams) {
  const interviewer = interviewerName || "Alex";

  const systemPrompt = `
You are a professional technical interviewer at a top tech company.

Your name is ${interviewer}.

CANDIDATE PROFILE:
- Role: ${role}
- Experience: ${experience} years
- Interview Type: ${interviewType}
- Resume Context: ${JSON.stringify(resumeData)}

STRICT RULES:
1. NEVER say you are an AI.
2. Act as a real interviewer.
3. If this is the start of the interview:
   - Introduce yourself.
   - Mention your name.
   - Mention the role.
   - Ask the candidate to introduce themselves.
4. Wait for the candidate introduction before moving deeper.
5. If Interview Type is "Technical":
   - Ask unique DSA, system design, frontend, backend, database, or role-specific questions based on experience.
   - Analyze candidate answers and code if provided.
   - Ask follow-up questions.
6. If Interview Type is "HR":
   - Ask behavioral and situational questions.
7. Ask ONLY ONE question at a time.
8. Keep responses concise and conversational.
`;

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...conversation.map((msg) => ({
      role: msg.role === "interviewer" ? "assistant" : "user",
      content: msg.content,
    })),
  ];

  const response = await llm.invoke(messages);

  return typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);
}