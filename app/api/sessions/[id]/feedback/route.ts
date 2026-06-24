import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

import { sendReportEmail } from "@/lib/mailer";
import { generatePerformanceReport } from "@/lib/generate-performance-report";

interface Ratings {
  problemSolving: number;
  communication: number;
  codeQuality: number;
  timeManagement: number;
  overallImpression: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const body = await req.json();

    const ratings: Ratings = {
      problemSolving: Number(body.problemSolving),
      communication: Number(body.communication),
      codeQuality: Number(body.codeQuality),
      timeManagement: Number(body.timeManagement),
      overallImpression: Number(body.overallImpression),
    };

    for (const [key, value] of Object.entries(ratings)) {
      if (
        Number.isNaN(value) ||
        value < 1 ||
        value > 5
      ) {
        return NextResponse.json(
          {
            message: `Invalid rating for ${key}. Must be between 1 and 5.`,
          },
          { status: 400 }
        );
      }
    }

    const session = await prisma.session.findUnique({
      where: {
        id,
      },

      include: {
        host: true,
        participant: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 }
      );
    }

    if (session.hostId !== user.id) {
      return NextResponse.json(
        {
          message:
            "Only the host can submit feedback",
        },
        { status: 403 }
      );
    }

    if (session.sessionType !== "private") {
      return NextResponse.json(
        {
          message:
            "Feedback is only available for private sessions",
        },
        { status: 400 }
      );
    }

    if (!session.participant) {
      return NextResponse.json(
        {
          message:
            "No participant to evaluate",
        },
        { status: 400 }
      );
    }

    const feedback = {
      ...ratings,
      submittedAt: new Date(),
    };

    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        feedback,
      },
    });

    const aiReport =
      await generatePerformanceReport({
        problem: session.problem,
        difficulty: session.difficulty,
        interviewerName: session.host.name,
        candidateName:
          session.participant.name,

        ...ratings,
      });

    await sendReportEmail({
      toEmail: session.participant.email,
      candidateName:
        session.participant.name,
      hostName: session.host.name,
      problem: session.problem,
      ratings,
      aiReport,
    });

    return NextResponse.json({
      message: `Feedback saved and performance report sent to ${session.participant.email}`,
      aiReport,
    });
  } catch (error) {
    console.error(
      "Error submitting feedback:",
      error
    );

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}