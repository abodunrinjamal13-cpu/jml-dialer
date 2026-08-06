import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, body, contactId } = await request.json();

    if (!to || !body) {
      return NextResponse.json({ error: "Missing 'to' or 'body'" }, { status: 400 });
    }

    const settings = await prisma.settings.findUnique({ where: { user_id: userId } });

    if (
      !settings?.twilio_account_sid ||
      !settings?.twilio_auth_token ||
      !settings?.twilio_phone_number
    ) {
      return NextResponse.json(
        { error: "TWILIO_NOT_LINKED", message: "Please link your Twilio account in Settings before sending messages." },
        { status: 400 }
      );
    }

    const client = twilio(settings.twilio_account_sid, settings.twilio_auth_token);

    const twilioMessage = await client.messages.create({
      body,
      from: settings.twilio_phone_number,
      to,
    });

    const savedMessage = await prisma.message.create({
      data: {
        user_id: userId,
        contact_id: contactId ?? null,
        phone_number: to,
        message: body,
        direction: "outgoing",
        status: twilioMessage.status,
      },
    });

    return NextResponse.json(savedMessage);
  } catch (error: any) {
    console.error("SMS send error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}