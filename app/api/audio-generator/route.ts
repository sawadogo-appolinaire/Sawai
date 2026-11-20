import prisma from "@/lib/db";
import { createAudioFileFromText } from "@/lib/elevenlabs";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json("You are not authorized to make a request.", {
        status: 401,
      });
    }

    const body: { prompt?: string } = await req.json();

    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json("The information is empty or invalid.", {
        status: 400,
      });
    }

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const userRequestStatus = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        toDayRequest: true,
        requestGestion: true,
      },
    });

    if (!userRequestStatus) {
      return NextResponse.json("User does not exist.", {
        status: 404,
      });
    }

    if (userRequestStatus.toDayRequest < 10) {
      const audioName = await createAudioFileFromText(body.prompt);
      const audioUrl = `/user-audio-generate/${audioName}`;

      await prisma.audioGenerator.createMany({
        data: [
          {
            userId: userRequestStatus.id,
            who: "YOU",
            content: body.prompt,
          },
          {
            userId: userRequestStatus.id,
            who: "Ai",
            audioUrl,
          },
        ],
      });

      if (!userRequestStatus.requestGestion) {
        await prisma.requestGestion.create({
          data: {
            userId: userRequestStatus.id,
            EndRequestTime: tomorrow,
          },
        });
      }

      await prisma.user.update({
        where: {
          id: userRequestStatus.id,
        },
        data: {
          toDayRequest: {
            increment: 1,
          },
        },
      });

      return NextResponse.json("Request succes.", {
        status: 200,
      });
    }

    return NextResponse.json(
      { todayRequestNumberSupTen: true },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("\n========== AUDIO GENERATOR ROUTE ERROR ==========");

    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Name:", error.name);
      console.error("Stack:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }

    console.error("=================================================\n");

    return NextResponse.json(
      {
        error: "Request failed.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
