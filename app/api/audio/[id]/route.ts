import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const audio = await prisma.audioGenerator.findFirst({
      where: {
        id,
        userId: user.id,
        who: "Ai",
      },
      select: {
        audioUrl: true,
      },
    });

    if (!audio?.audioUrl) {
      return new NextResponse("Audio not found", { status: 404 });
    }

    const blob = await get(audio.audioUrl, {
      access: "private",
    });

    if (!blob || blob.statusCode !== 200) {
      return new NextResponse("Audio not found", { status: 404 });
    }

    return new NextResponse(blob.stream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("AUDIO STREAM ERROR:", error);

    return new NextResponse("Unable to retrieve audio", {
      status: 500,
    });
  }
}
