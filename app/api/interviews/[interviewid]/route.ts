import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
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

    return NextResponse.json(interview);
  } catch (error) {
    console.error("Error fetching interview:", error);

    return NextResponse.json(
      { error: "Failed to fetch interview" },
      { status: 500 }
    );
  }
}