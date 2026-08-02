import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid')?.toString();
    const callStatus = formData.get('CallStatus')?.toString();
    const from = formData.get('From')?.toString();
    const to = formData.get('To')?.toString();
    const duration = formData.get('CallDuration')?.toString();

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 });
    }

    // Upsert call history into database
    await prisma.call.upsert({
      where: { callSid },
      update: {
        status: callStatus,
        duration: duration ? parseInt(duration) : 0,
      },
      create: {
        callSid,
        status: callStatus || 'initiated',
        fromNumber: from || '',
        toNumber: to || '',
        duration: duration ? parseInt(duration) : 0,
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