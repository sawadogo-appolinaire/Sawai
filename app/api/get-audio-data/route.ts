import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json("You are not authorized to make a request.", {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json("User not found.", {
        status: 404,
      });
    }

    const data = await prisma.audioGenerator.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        who: true,
        content: true,
        audioUrl: true,
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET AUDIO DATA ERROR:", error);

    return NextResponse.json("Request failed.", {
      status: 500,
    });
  }
}
