import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.settings.findUnique({ where: { user_id: userId } });

  if (!settings?.twilio_account_sid || !settings?.twilio_auth_token) {
    return NextResponse.json({ error: "Twilio not linked" }, { status: 400 });
  }

  try {
    const client = twilio(settings.twilio_account_sid, settings.twilio_auth_token);
    const balance = await client.balance.fetch();
    return NextResponse.json({ balance: balance.balance, currency: balance.currency });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}