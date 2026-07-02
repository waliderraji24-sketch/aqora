import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectMongo from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/jwt';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const authorId = url.searchParams.get('authorId');

  const client = await connectMongo();
  const db = client.db();
  const query: Record<string, unknown> = {};

  if (authorId) {
    query.authorId = authorId;
  }

  const posts = await db
    .collection('posts')
    .find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const postIds = posts.map((post) => post._id.toString());

  const [likeCounts, commentCounts] = await Promise.all([
    db
      .collection('likes')
      .aggregate([
        { $match: { postId: { $in: postIds } } },
        { $group: { _id: '$postId', count: { $sum: 1 } } },
      ])
      .toArray(),
    db
      .collection('comments')
      .aggregate([
        { $match: { postId: { $in: postIds } } },
        { $group: { _id: '$postId', count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const likeMap = likeCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const commentMap = commentCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const serializedPosts = posts.map((post) => ({
    id: post._id.toString(),
    authorId: post.authorId,
    authorName: post.authorName,
    content: post.content,
    createdAt: post.createdAt,
    likeCount: likeMap[post._id.toString()] || 0,
    commentCount: commentMap[post._id.toString()] || 0,
  }));

  return NextResponse.json({ posts: serializedPosts });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'يجب تسجيل الدخول لإضافة منشور.' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  if (!payload?.id) {
    return NextResponse.json({ message: 'رمز المصادقة غير صالح.' }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ message: 'المحتوى لا يمكن أن يكون فارغاً.' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();
  const user = await db.collection('users').findOne({ _id: new ObjectId(payload.id as string) });

  if (!user) {
    return NextResponse.json({ message: 'المستخدم غير موجود.' }, { status: 401 });
  }

  const now = new Date();
  const post = {
    authorId: payload.id as string,
    authorName: user.name,
    content: content.trim(),
    createdAt: now,
  };

  const result = await db.collection('posts').insertOne(post);
  await db.collection('users').updateOne({ _id: user._id }, { $inc: { postsCount: 1 } });

  return NextResponse.json({
    post: {
      id: result.insertedId.toString(),
      authorId: post.authorId,
      authorName: post.authorName,
      content: post.content,
      createdAt: post.createdAt,
      likeCount: 0,
      commentCount: 0,
    },
  }, { status: 201 });
}
