import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/backend/prisma";
import { getCurrentUser } from "@/src/lib/backend/current-user";

export async function GET(
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