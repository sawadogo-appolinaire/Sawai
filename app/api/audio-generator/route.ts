import prisma from "@/lib/db";
import { createAudioFileFromText } from "@/lib/elevenlabs";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = auth();
    const userId = (await user).userId as string;
    const body = await req.json();
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (!userId) {
      return NextResponse.json("You are not authorized to make a request.", {
        status: 500,
      });
    }

    if (!body) {
      return NextResponse.json("The information is empty.", {
        status: 500,
      });
    }

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
      return NextResponse.json("User can not exist.", {
        status: 500,
      });
    }

    if ((userRequestStatus?.toDayRequest as number) < 10) {
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
            audioUrl: audioUrl,
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

      return NextResponse.json("Request succes.", { status: 200 });
    } else {
      return NextResponse.json(
        { todayRequestNumberSupTen: true },
        { status: 200 },
      );
    }
  } catch (error: any) {
    console.error("\n========== AUDIO GENERATOR ROUTE ERROR ==========");
    console.error("Message:", error?.message);
    console.error("Name:", error?.name);
    console.error("Stack:", error?.stack);
    console.dir(error, { depth: 10 });
    console.error("=================================================\n");

    return NextResponse.json(
      {
        error: "Request failed.",
        details: error?.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
}
