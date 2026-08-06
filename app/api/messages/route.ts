import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const from = formData.get("From") as string | null;
    const to = formData.get("To") as string | null;
    const body = formData.get("Body") as string | null;

    if (!from || !to || !body) {
      return new NextResponse("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Figure out which user owns this Twilio number
    const settings = await (prisma.settings as any).findFirst({
      where: { twilio_phone_number: to },
    });

    if (!settings) {
      console.error("No user found for Twilio number:", to);
      return new NextResponse("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Try to match an existing contact by phone number
    const contact = await prisma.contact.findFirst({
      where: { user_id: settings.user_id, phone: from },
    });

    await prisma.message.create({
      data: {
        user_id: settings.user_id,
        contact_id: contact?.id ?? null,
        phone_number: from,
        message: body,
        direction: "incoming",
        status: "received",
      },
    });

    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error: any) {
    console.error("Inbound SMS webhook error:", error.message);
    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }
}