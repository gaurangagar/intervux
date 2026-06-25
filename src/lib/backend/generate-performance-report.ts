import { llm } from "@/src/lib/backend/llm";

interface GeneratePerformanceReportParams {
  problem: string;
  difficulty: string;

  interviewerName: string;
  candidateName: string;

  problemSolving: number;
  communication: number;
  codeQuality: number;
  timeManagement: number;
  overallImpression: number;
}

export async function generatePerformanceReport({
  problem,
  difficulty,
  interviewerName,
  candidateName,
  problemSolving,
  communication,
  codeQuality,
  timeManagement,
  overallImpression,
}: GeneratePerformanceReportParams): Promise<string> {
  const avg = (
    (problemSolving +
      communication +
      codeQuality +
      timeManagement +
      overallImpression) /
    5
  ).toFixed(1);

  const prompt = `
You are a professional technical interview evaluator.

Write a detailed, honest, and encouraging performance report for a candidate based on their interview ratings.

Interview Details:
- Problem: ${problem}
- Difficulty: ${difficulty}
- Interviewer: ${interviewerName}
- Candidate: ${candidateName}

Performance Ratings (out of 5):
- Problem Solving: ${problemSolving}/5
- Communication: ${communication}/5
- Code Quality: ${codeQuality}/5
- Time Management: ${timeManagement}/5
- Overall Impression: ${overallImpression}/5
- Average Score: ${avg}/5

Write a professional performance report in 3-4 paragraphs.

The tone should be encouraging and constructive.

Include:
1. An opening summary of the candidate's overall performance
2. Specific strengths based on high-rated areas
3. Areas for improvement based on lower-rated areas with actionable tips
4. A motivating closing statement

Do not use bullet points.
Write in flowing paragraphs.
`;

  try {
    const response = await llm.invoke(prompt);

    if (typeof response.content === "string") {
      return response.content;
    }

    if (Array.isArray(response.content)) {
      return response.content
        .map((item: any) =>
          typeof item === "string"
            ? item
            : item?.text || ""
        )
        .join("");
    }

    return String(response.content);
  } catch (error) {
    console.error(
      "Performance report generation failed:",
      error
    );

    return `${candidateName} participated in a coding interview focused on "${problem}" and achieved an average score of ${avg}/5. The candidate demonstrated strengths across multiple evaluated areas and showed promising technical potential. Continued practice in problem solving, communication, code quality, and interview preparation will help further strengthen future performance. Overall, this was a positive interview experience with clear opportunities for continued growth and success.`;
  }
}