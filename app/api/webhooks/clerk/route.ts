import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new NextResponse("Missing webhook secret", {
      status: 500,
    });
  }

  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing Svix headers", {
      status: 400,
    });
  }

  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch {
    return new NextResponse("Invalid webhook signature", {
      status: 400,
    });
  }

  if (evt.type === "user.created") {
    const { id, first_name, username, email_addresses } = evt.data;

    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      return new NextResponse("User email missing", {
        status: 400,
      });
    }

    await prisma.user.upsert({
      where: {
        clerkId: id,
      },
      update: {},
      create: {
        clerkId: id,
        name: username || first_name || email,
        email,
      },
    });
  }

  if (evt.type === "user.deleted") {
    await prisma.user.deleteMany({
      where: {
        clerkId: evt.data.id,
      },
    });
  }

  return NextResponse.json({ success: true });
}
