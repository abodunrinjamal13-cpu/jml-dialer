import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid')?.toString();
    const callStatus = formData.get('CallStatus')?.toString();
    const duration = formData.get('CallDuration')?.toString();

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 });
    }

    await prisma.callHistory.updateMany({
      where: { twilio_sid: callSid },
      data: {
        status: callStatus,
        duration: duration ? parseInt(duration) : undefined,
        ended_at: callStatus === 'completed' ? new Date() : undefined,
      },
    });

    return new NextResponse('<Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}