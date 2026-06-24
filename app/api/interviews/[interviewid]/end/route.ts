import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { generateInterviewFeedback } from "@/lib/interview-feedback";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;

    if (!userId) {
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

    const feedback =
      await generateInterviewFeedback({
        role: interview.role,
        experience: interview.experience,
        conversation:
          (interview.conversation as any[]) || [],
      });

    const updatedInterview =
      await prisma.mockInterview.update({
        where: {
          id: interview.id,
        },
        data: {
          status: "completed",
          feedback,
        },
      });

    return NextResponse.json(updatedInterview);
  } catch (error) {
    console.error(
      "Error ending interview:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to end interview",
      },
      { status: 500 }
    );
  }
}