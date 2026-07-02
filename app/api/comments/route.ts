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
  const comments = await db
    .collection('comments')
    .find({ postId })
    .sort({ createdAt: -1 })
    .toArray();

  const serialized = comments.map((comment) => ({
    id: comment._id.toString(),
    postId: comment.postId,
    authorId: comment.authorId,
    authorName: comment.authorName,
    content: comment.content,
    createdAt: comment.createdAt,
  }));

  return NextResponse.json({ comments: serialized });
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

  const { postId, content } = await req.json();
  if (!postId || !content || typeof content !== 'string') {
    return NextResponse.json({ message: 'postId والمحتوى مطلوبان.' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();
  const user = await db.collection('users').findOne({ _id: new ObjectId(payload.id as string) });

  if (!user) {
    return NextResponse.json({ message: 'المستخدم غير موجود.', status: 401 });
  }

  const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
  if (!post) {
    return NextResponse.json({ message: 'المنشور غير موجود.' }, { status: 404 });
  }

  const now = new Date();
  const result = await db.collection('comments').insertOne({
    postId,
    authorId: payload.id as string,
    authorName: user.name,
    content: content.trim(),
    createdAt: now,
  });

  // Create notification for the post author (if different)
  if (post.authorId && post.authorId !== payload.id) {
    await db.collection('notifications').insertOne({
      userId: post.authorId,
      type: 'comment',
      fromUserId: payload.id as string,
      postId,
      createdAt: new Date(),
      read: false,
    });
  }

  return NextResponse.json({
    comment: {
      id: result.insertedId.toString(),
      postId,
      authorId: payload.id as string,
      authorName: user.name,
      content: content.trim(),
      createdAt: now,
    },
  }, { status: 201 });
}
