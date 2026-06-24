import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { streamClient, chatClient } from "@/lib/stream";
import { sendInviteEmail } from "@/lib/mailer";

const VALID_DIFFICULTIES = ["easy", "medium", "hard"] as const;

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

    const {
      problem,
      difficulty,
      inviteeEmail,
    } = await req.json();

    if (
      !problem ||
      !difficulty ||
      !inviteeEmail
    ) {
      return NextResponse.json(
        {
          message:
            "Problem, difficulty, and invitee email are required",
        },
        { status: 400 }
      );
    }

    if (
      !VALID_DIFFICULTIES.includes(
        difficulty as (typeof VALID_DIFFICULTIES)[number]
      )
    ) {
      return NextResponse.json(
        {
          message: "Invalid difficulty",
        },
        { status: 400 }
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(inviteeEmail)) {
      return NextResponse.json(
        {
          message: "Invalid email address",
        },
        { status: 400 }
      );
    }

    // Optional self-invite prevention
    if (
      user.email.toLowerCase() ===
      inviteeEmail.toLowerCase().trim()
    ) {
      return NextResponse.json(
        {
          message:
            "You cannot invite yourself to a session",
        },
        { status: 400 }
      );
    }

    const inviteToken =
      crypto.randomBytes(32).toString("hex");

    const callId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    const session = await prisma.session.create({
      data: {
        problem,
        difficulty,
        hostId: user.id,
        callId,

        sessionType: "private",

        inviteeEmail: inviteeEmail
          .toLowerCase()
          .trim(),

        inviteToken,
      },
    });

    try {
      await streamClient.video
        .call("default", callId)
        .getOrCreate({
          data: {
            created_by_id: user.clerkId,
            custom: {
              sessionId: session.id,
              problem,
              difficulty,
            },
          },
        });

      const channel = chatClient.channel(
        "messaging",
        callId,
        {
          created_by_id: user.clerkId,
          members: [user.clerkId],
        } as any
      );

      await channel.create();

      const joinLink = `${process.env.NEXT_PUBLIC_APP_URL
        }/join/${inviteToken}`;

      await sendInviteEmail({
        toEmail: inviteeEmail,
        hostName: user.name,
        joinLink,
      });
    } catch (error) {
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      });

      throw error;
    }

    return NextResponse.json(
      {
        session,
        message: `Invitation sent successfully to ${inviteeEmail}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Error creating private session:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}