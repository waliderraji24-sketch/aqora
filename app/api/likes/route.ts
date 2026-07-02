import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectMongo from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/jwt';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const postId = url.searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ message: 'postId مطلوب.' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();
  const likeCount = await db.collection('likes').countDocuments({ postId });

  return NextResponse.json({ postId, likeCount });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'يجب تسجيل الدخول.' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  if (!payload?.id) {
    return NextResponse.json({ message: 'رمز المصادقة غير صالح.' }, { status: 401 });
  }

  const { postId } = await req.json();
  if (!postId || typeof postId !== 'string') {
    return NextResponse.json({ message: 'معرف المنشور مطلوب.' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();

  const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
  if (!post) {
    return NextResponse.json({ message: 'المنشور غير موجود.' }, { status: 404 });
  }

  const existing = await db.collection('likes').findOne({ postId, userId: payload.id as string });
  if (existing) {
    return NextResponse.json({ message: 'لقد أعجبت بهذا المنشور بالفعل.' }, { status: 400 });
  }

  await db.collection('likes').insertOne({ postId, userId: payload.id as string, createdAt: new Date() });

  // Create notification for the post author (if different)
  if (post.authorId && post.authorId !== payload.id) {
    await db.collection('notifications').insertOne({
      userId: post.authorId,
      type: 'like',
      fromUserId: payload.id as string,
      postId,
      createdAt: new Date(),
      read: false,
    });
  }

  return NextResponse.json({ postId, liked: true }, { status: 201 });
}
