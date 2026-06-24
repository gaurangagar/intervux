import { chatClient } from "@/lib/stream";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;

    const token = chatClient.createToken(userId);

    return NextResponse.json({
      token,
      userId,
      userName: user?.fullName || "",
      userImage: user?.imageUrl || "",
    });
  } catch (error) {
    console.error("Error generating Stream token:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}