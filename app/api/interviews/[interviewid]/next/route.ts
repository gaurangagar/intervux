import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { generateInterviewQuestion } from "@/src/lib/interview-generator";
import { getCurrentUser } from "@/src/lib/current-user";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { interviewId } = await params;

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

    if (interview.status === "completed") {
      return NextResponse.json(
        { error: "Interview already completed" },
        { status: 400 }
      );
    }

    const aiMessage = await generateInterviewQuestion({
      interviewerName: interview.interviewerName,
      role: interview.role,
      experience: interview.experience,
      interviewType: interview.interviewType,
      resumeData: interview.resumeData,
      conversation:
        (interview.conversation as any[]) || [],
    });

    const updatedConversation = [
      ...((interview.conversation as any[]) || []),
      {
        role: "interviewer",
        content: aiMessage,
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
      message: aiMessage,
    });
  } catch (error) {
    console.error("Error getting next question:", error);

    return NextResponse.json(
      {
        error: "Failed to get next question",
      },
      { status: 500 }
    );
  }
}