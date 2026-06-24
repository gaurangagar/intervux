import { chatClient } from "@/lib/stream";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();

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