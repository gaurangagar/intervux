import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/backend/prisma";
import { streamClient, chatClient } from "@/src/lib/backend/stream";
import { getCurrentUser } from "@/src/lib/backend/current-user";

const VALID_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { problem, difficulty } = await req.json();

        if (!problem || !difficulty) {
            return NextResponse.json(
                {
                    error: "Problem and difficulty are required",
                },
                { status: 400 }
            );
        }

        if (!VALID_DIFFICULTIES.includes(difficulty)) {
            return NextResponse.json(
                {
                    error: "Invalid difficulty",
                },
                { status: 400 }
            );
        }

        const callId = `session_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 9)}`;

        const session = await prisma.session.create({
            data: {
                problem,
                difficulty,
                hostId: user.id,
                callId,
            },
        });

        try {
            // Create Stream Video Call
            await streamClient.video
                .call("default", callId)
                .getOrCreate({
                    data: {
                        created_by_id: user.clerkId,
                        custom: {
                            sessionId: session.id,
                            problem,
                            difficulty,
                        },
                    },
                });

            // Create Stream Chat Channel
            const channel = chatClient.channel(
                "messaging",
                callId,
                {
                    created_by_id: user.clerkId,
                    members: [user.clerkId],
                }
            );

            await channel.create();
        } catch (streamError) {
            // Rollback session if Stream setup fails
            await prisma.session.delete({
                where: {
                    id: session.id,
                },
            });

            throw streamError;
        }

        return NextResponse.json(
            {
                session,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "Error creating session:",
            error
        );

        return NextResponse.json(
            {
                error: "Internal Server Error",
            },
            { status: 500 }
        );
    }
}