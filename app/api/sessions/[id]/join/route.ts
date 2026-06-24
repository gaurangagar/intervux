import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { chatClient } from "@/src/lib/stream";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/src/lib/current-user";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const session = await prisma.session.findUnique({
            where: {
                id,
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

        if (session.status !== "active") {
            return NextResponse.json(
                {
                    message:
                        "Cannot join a completed session",
                },
                {
                    status: 400,
                }
            );
        }

        if (session.hostId === user.id) {
            return NextResponse.json(
                {
                    message:
                        "Host cannot join their own session as participant",
                },
                {
                    status: 400,
                }
            );
        }

        if (session.participantId) {
            return NextResponse.json(
                {
                    message: "Session is full",
                },
                {
                    status: 409,
                }
            );
        }

        const updatedSession =
            await prisma.session.update({
                where: {
                    id: session.id,
                },
                data: {
                    participantId: user.id,
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

        try {
            const channel = chatClient.channel(
                "messaging",
                session.callId
            );

            await channel.addMembers([
                user.clerkId,
            ]);
        } catch (error) {
            console.error(
                "Failed to add Stream member:",
                error
            );
        }

        return NextResponse.json({
            session: updatedSession,
        });
    } catch (error) {
        console.error(
            "Error joining session:",
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