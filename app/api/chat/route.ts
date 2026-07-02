import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectMongo from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/jwt';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const conversationId = url.searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ message: 'conversationId مطلوب.' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();
  const messages = await db
    .collection('messages')
    .find({ conversationId })
    .sort({ createdAt: 1 })
    .toArray();

  return NextResponse.json({
    conversationId,
    messages: messages.map((message) => ({
      id: message._id.toString(),
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content,
      createdAt: message.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'يجب تسجيل الدخول.', status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  if (!payload?.id) {
    return NextResponse.json({ message: 'رمز المصادقة غير صالح.', status: 401 });
  }

  const { conversationId, content } = await req.json();
  if (!conversationId || !content || typeof content !== 'string') {
    return NextResponse.json({ message: 'conversationId والمحتوى مطلوبان.' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();
  const user = await db.collection('users').findOne({ _id: new ObjectId(payload.id as string) });

  if (!user) {
    return NextResponse.json({ message: 'المستخدم غير موجود.', status: 401 });
  }

  const now = new Date();
  const result = await db.collection('messages').insertOne({
    conversationId,
    senderId: payload.id as string,
    senderName: user.name,
    content: content.trim(),
    createdAt: now,
  });

  return NextResponse.json({
    message: {
      id: result.insertedId.toString(),
      conversationId,
      senderId: payload.id as string,
      senderName: user.name,
      content: content.trim(),
      createdAt: now,
    },
  }, { status: 201 });
}
