import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '../../../lib/mongodb';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ message: 'ادخل على الأقل حرفين للبحث' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();

  // البحث عن المستخدمين
  const users = await db
    .collection('users')
    .find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
      ],
    })
    .limit(10)
    .toArray();

  // البحث عن المنشورات
  const posts = await db
    .collection('posts')
    .find({ content: { $regex: query, $options: 'i' } })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  return NextResponse.json({
    query,
    users: users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      bio: u.bio,
      followersCount: u.followersCount ?? 0,
    })),
    posts: posts.map((p) => ({
      id: p._id.toString(),
      authorId: p.authorId,
      authorName: p.authorName,
      content: p.content,
      createdAt: p.createdAt,
    })),
  });
}
