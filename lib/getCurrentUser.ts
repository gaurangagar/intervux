import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getCurrentUser() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId,
      },
    });

    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}
