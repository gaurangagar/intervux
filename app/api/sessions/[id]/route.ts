import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.session.findUnique({
      where: {
        id,
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
    });

    if (!session) {
      return NextResponse.json(
        {
          message: "Session not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      session,
    });
  } catch (error) {
    console.error(
      "Error fetching session:",
      error
    );

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}