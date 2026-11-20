import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json("You are not authorized.", {
        status: 401,
      });
    }

    const body = await req.json();

    if (!body?.name || !body?.email) {
      return NextResponse.json("The information is empty or invalid.", {
        status: 400,
      });
    }

    const data = await prisma.user.upsert({
      where: {
        clerkId: userId,
      },
      update: {
        name: body.name,
        email: body.email,
      },
      create: {
        clerkId: userId,
        name: body.name,
        email: body.email,
      },
    });

    return NextResponse.json({ success: true, user: data }, { status: 200 });
  } catch (error: unknown) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json("Request failed.", {
      status: 500,
    });
  }
}
