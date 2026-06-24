import { chatClient } from "@/lib/stream";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = user.id;

    const token = chatClient.createToken(userId);

    return NextResponse.json({
      token,
      userId,
      userName: user?.name || "",
      userImage: user?.profileImage || "",
    });
  } catch (error) {
    console.error("Error generating Stream token:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}