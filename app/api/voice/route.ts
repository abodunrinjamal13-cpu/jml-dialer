import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.settings.findUnique({ where: { user_id: userId } });

    if (
      !settings?.twilio_account_sid ||
      !settings?.twilio_api_key_sid ||
      !settings?.twilio_api_key_secret ||
      !settings?.twilio_twiml_app_sid
    ) {
      return NextResponse.json(
        { error: "TWILIO_NOT_LINKED", message: "Please link your Twilio account in Settings before making calls." },
        { status: 400 }
      );
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const accessToken = new AccessToken(
      settings.twilio_account_sid,
      settings.twilio_api_key_sid,
      settings.twilio_api_key_secret,
      { identity: userId }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: settings.twilio_twiml_app_sid,
      incomingAllow: true,
    });

    accessToken.addGrant(voiceGrant);

    return NextResponse.json({ token: accessToken.toJwt() });
  } catch (error: any) {
    console.error("Token error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}