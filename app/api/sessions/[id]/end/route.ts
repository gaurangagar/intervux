import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { streamClient, chatClient } from "@/lib/stream";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const session = await prisma.session.findUnique({
            where: {
                id,
            },

            include: {
                host: true,
                participant: true,
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

        if (session.hostId !== user.id) {
            return NextResponse.json(
                {
                    message:
                        "Only the host can end the session",
                },
                {
                    status: 403,
                }
            );
        }

        if (session.status === "completed") {
            return NextResponse.json(
                {
                    message:
                        "Session is already completed",
                },
                {
                    status: 400,
                }
            );
        }

        try {
            const call = streamClient.video.call(
                "default",
                session.callId
            );

            await call.delete({
                hard: true,
            });
        } catch (error) {
            console.error(
                "Failed to delete Stream call:",
                error
            );
        }

        try {
            const channel = chatClient.channel(
                "messaging",
                session.callId
            );

            await channel.delete();
        } catch (error) {
            console.error(
                "Failed to delete Stream channel:",
                error
            );
        }

        const updatedSession =
            await prisma.session.update({
                where: {
                    id: session.id,
                },
                data: {
                    status: "completed",
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

        return NextResponse.json({
            session: updatedSession,
            message: "Session ended successfully",
        });
    } catch (error) {
        console.error(
            "Error ending session:",
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