import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";
import { generateInterviewFeedback } from "@/lib/interview-feedback";

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