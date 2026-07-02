import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectMongo from '../../../lib/mongodb';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'المعرف مطلوب.' }, { status: 400 });
  }

  let userId: ObjectId;
  try {
    userId = new ObjectId(id);
  } catch {
    return NextResponse.json({ message: 'معرف المستخدم غير صالح.' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();
  const user = await db.collection('users').findOne({ _id: userId }, { projection: { passwordHash: 0 } });

  if (!user) {
    return NextResponse.json({ message: 'المستخدم غير موجود.' }, { status: 404 });
  }

  const postsCount = await db.collection('posts').countDocuments({ authorId: id });
  const recentPosts = await db
    .collection('posts')
    .find({ authorId: id })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  const serializedUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    bio: user.bio,
    followersCount: user.followersCount ?? 0,
    postsCount,
    recentPosts: recentPosts.map((post) => ({
      id: post._id.toString(),
      content: post.content,
      createdAt: post.createdAt,
    })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return NextResponse.json({ user: serializedUser });
}
