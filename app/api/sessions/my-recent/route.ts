import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
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

        const sessions = await prisma.session.findMany({
            where: {
                status: "completed",

                OR: [
                    {
                        hostId: user.id,
                    },
                    {
                        participantId: user.id,
                    },
                ],
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

            orderBy: {
                createdAt: "desc",
            },

            take: 20,
        });

        return NextResponse.json({
            sessions,
        });
    } catch (error) {
        console.error(
            "Error fetching recent sessions:",
            error
        );

        return NextResponse.json(
            {
                message: "Internal Server Error",
            },
            { status: 500 }
        );
    }
}