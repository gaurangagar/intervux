import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { chatClient } from "@/lib/stream";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
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

        const { token } = await params;

        const session = await prisma.session.findUnique({
            where: {
                inviteToken: token,
            },
        });

        if (!session) {
            return NextResponse.json(
                {
                    message:
                        "Invalid or expired invite link",
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
                        "This session has already ended",
                },
                {
                    status: 400,
                }
            );
        }

        const userEmail = user.email
            .toLowerCase()
            .trim();

        if (
            userEmail !==
            session.inviteeEmail?.toLowerCase().trim()
        ) {
            return NextResponse.json(
                {
                    message: `This invitation was sent to ${session.inviteeEmail}. Please log in with that email to join.`,
                },
                {
                    status: 403,
                }
            );
        }

        if (session.hostId === user.id) {
            return NextResponse.json(
                {
                    message:
                        "You are the host of this session",
                },
                {
                    status: 400,
                }
            );
        }

        if (!session.participantId) {
            await prisma.session.update({
                where: {
                    id: session.id,
                },
                data: {
                    participantId: user.id,
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
        } else if (
            session.participantId !== user.id
        ) {
            return NextResponse.json(
                {
                    message: "Session is full",
                },
                {
                    status: 409,
                }
            );
        }

        return NextResponse.json({
            sessionId: session.id,
        });
    } catch (error) {
        console.error(
            "Error joining private session:",
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