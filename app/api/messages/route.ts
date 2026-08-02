import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust according to your prisma client path

// GET: Read all messages
export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, sender, receiver } = body;

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        sender,
        receiver,
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}