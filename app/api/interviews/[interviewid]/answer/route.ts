import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/src/lib/current-user";

import prisma from "@/src/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { interviewId } = await params;

    const { answer, code } = await req.json();

    const interview = await prisma.mockInterview.findFirst({
      where: {
        id: interviewId,
        userId: user.id,
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    let fullAnswer =
      answer || "I'm submitting my current code for your review.";

    if (code) {
      fullAnswer = `${fullAnswer}

[CANDIDATE CODE STATE]
\`\`\`
${code}
\`\`\``;
    }

    const currentConversation =
      (interview.conversation as any[]) || [];

    const updatedConversation = [
      ...currentConversation,
      {
        role: "candidate",
        content: fullAnswer,
      },
    ];

    await prisma.mockInterview.update({
      where: {
        id: interview.id,
      },
      data: {
        conversation: updatedConversation,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);

    return NextResponse.json(
      {
        error: "Failed to submit answer",
      },
      { status: 500 }
    );
  }
}