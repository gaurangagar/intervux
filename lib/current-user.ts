import { auth } from "@clerk/nextjs/server";
import prisma from "./prisma";
import { NextResponse } from "next/server";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
    )
  }

  return prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });
}