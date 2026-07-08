import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/src/lib/backend/prisma";

export async function POST(req: Request) {
  console.log("=== Clerk webhook received ===");
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

  const payload = await req.text();
  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing headers", { status: 400 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = evt;

  console.log("Webhook event:", type);
  console.log("User ID:", data.id);

  if (type === "user.created") {
    await prisma.user.create({
      data: {
        clerkId: data.id,
        email: data.email_addresses[0]?.email_address,
        name:
          `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        profileImage: data.image_url ?? "",
      },
    });
  }

  if (type === "user.updated") {
    await prisma.user.update({
      where: {
        clerkId: data.id,
      },
      data: {
        email: data.email_addresses[0]?.email_address,
        name:
          `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        profileImage: data.image_url ?? "",
      },
    });
  }

  if (type === "user.deleted") {
    await prisma.user.delete({
      where: {
        clerkId: data.id,
      },
    });
  }

  return Response.json({ success: true });
}