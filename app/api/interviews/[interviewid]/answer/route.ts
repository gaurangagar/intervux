import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { interviewId } = await params;

    const { answer, code } = await req.json();

    const user = await prisma.user.findUnique({
      where: {
        clerkId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

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