import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '../../../lib/mongodb';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const client = await connectMongo();
  const db = client.db();

  const posts = await db
    .collection('posts')
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const users = await db
    .collection('users')
    .find({})
    .sort({ followersCount: -1 })
    .limit(10)
    .toArray();

  const totalPosts = await db.collection('posts').countDocuments({});

  return NextResponse.json({
    posts: posts.map((post) => ({
      id: post._id.toString(),
      authorId: post.authorId,
      authorName: post.authorName,
      content: post.content,
      createdAt: post.createdAt,
    })),
    trendingUsers: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      bio: user.bio,
      followersCount: user.followersCount ?? 0,
    })),
    pagination: {
      page,
      limit,
      total: totalPosts,
      hasMore: skip + limit < totalPosts,
    },
  });
}
