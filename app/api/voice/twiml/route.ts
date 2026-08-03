import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request: Request) {
  const formData = await request.formData();
  const to = formData.get("To") as string | null;

  const twiml = new twilio.twiml.VoiceResponse();

  if (to) {
    const dial = twiml.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER,
    });
    dial.number(to);
  } else {
    twiml.say("We couldn't complete this call. Goodbye.");
  }

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}