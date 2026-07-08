import { auth } from "@clerk/nextjs/server";
import prisma from "./prisma";

export async function getCurrentUser() {
  const { userId } = await auth();

  console.log("Clerk userId:", userId);

  if (!userId) {
    return null;
  }

  const user=await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  console.log("Database user:", user);

  return user;
}