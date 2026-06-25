import { NextResponse } from "next/server";
import prisma from "@/src/lib/backend/prisma";

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        status: "active",
        sessionType: {
          not: "private",
        },
      },

      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            clerkId: true,
          },
        },

        participant: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            clerkId: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 20,
    });

    return NextResponse.json({
      sessions,
    });
  } catch (error) {
    console.error(
      "Error fetching active sessions:",
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