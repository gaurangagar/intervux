import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";
import { parseResumePDF } from "@/lib/resume-parser";

const getInterviewerName = () => {
  const names = [
    "Alex",
    "Jordan",
    "Taylor",
    "Morgan",
    "Casey",
    "Riley",
    "Sam",
    "Jamie",
  ];

  return names[Math.floor(Math.random() * names.length)];
};

export async function POST(req: NextRequest) {
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

    const formData = await req.formData();

    const role = formData.get("role") as string;
    const experience = Number(formData.get("experience"));
    const interviewType = formData.get("interviewType") as string;

    if (
      !role ||
      !interviewType ||
      Number.isNaN(experience)
    ) {
      return NextResponse.json(
        {
          error:
            "role, experience and interviewType are required",
        },
        { status: 400 }
      );
    }

    const resumeFile = formData.get("resume") as File | null;

    let resumeData = null;

    if (resumeFile) {
      const parsedResume = await parseResumePDF(resumeFile);

      resumeData = {
        text: parsedResume.rawText,
        skills: parsedResume.skills,
        projects: parsedResume.projects,
        experience: parsedResume.experience,
        education: parsedResume.education,
      };
    }

    const interview = await prisma.mockInterview.create({
      data: {
        userId: user.id,
        role,
        experience,
        interviewType,
        interviewerName: getInterviewerName(),
        resumeData,
        conversation: [],
      },
    });

    return NextResponse.json(interview, {
      status: 201,
    });
  } catch (error) {
    console.error("Start interview error:", error);

    return NextResponse.json(
      {
        error: "Failed to start interview",
      },
      { status: 500 }
    );
  }
}