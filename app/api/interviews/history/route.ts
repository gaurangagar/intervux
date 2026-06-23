import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export async function GET() {
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

    const history = await prisma.mockInterview.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error(
      "Error fetching interview history:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch history",
      },
      { status: 500 }
    );
  }
}