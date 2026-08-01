import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

    if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
      throw new Error('Missing required Twilio environment variables');
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const accessToken = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: 'jml_user_browser',
    });

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    });

    accessToken.addGrant(voiceGrant);

    return NextResponse.json({
      token: accessToken.toJwt(),
    });
  } catch (error: any) {
    console.error('DETAILED TOKEN ERROR:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}