import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/current-user";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
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