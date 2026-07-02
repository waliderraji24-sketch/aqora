import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectMongo from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/jwt';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'يجب تسجيل الدخول.' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  if (!payload?.id) {
    return NextResponse.json({ message: 'رمز المصادقة غير صالح.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const targetId = url.searchParams.get('targetId');
  if (!targetId) {
    return NextResponse.json({ message: 'targetId مطلوب.' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();

  const following = await db.collection('follows').findOne({ followerId: payload.id as string, followingId: targetId });
  const followersCount = await db.collection('follows').countDocuments({ followingId: targetId });
  const followingCount = await db.collection('follows').countDocuments({ followerId: targetId });

  return NextResponse.json({ following: !!following, followersCount, followingCount });
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

  const { targetId, action } = await req.json();
  if (!targetId || (action !== 'follow' && action !== 'unfollow')) {
    return NextResponse.json({ message: 'targetId و action (follow|unfollow) مطلوبان.' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();

  const meId = payload.id as string;

  if (action === 'follow') {
    const exists = await db.collection('follows').findOne({ followerId: meId, followingId: targetId });
    if (exists) {
      return NextResponse.json({ message: 'تم المتابعة مسبقاً.' }, { status: 409 });
    }

    await db.collection('follows').insertOne({ followerId: meId, followingId: targetId, createdAt: new Date() });
    try {
      await db.collection('users').updateOne({ _id: new ObjectId(targetId) }, { $inc: { followersCount: 1 } });
    } catch (e) {
      // ignore if targetId is not an ObjectId (legacy)
    }
    try {
      await db.collection('users').updateOne({ _id: new ObjectId(meId) }, { $inc: { followingCount: 1 } });
    } catch (e) {
      // ignore
    }

    // Create notification for the followed user
    if (targetId !== meId) {
      await db.collection('notifications').insertOne({
        userId: targetId,
        type: 'follow',
        fromUserId: meId,
        createdAt: new Date(),
        read: false,
      });
    }

    return NextResponse.json({ success: true });
  }

  // unfollow
  await db.collection('follows').deleteOne({ followerId: meId, followingId: targetId });
  try {
    await db.collection('users').updateOne({ _id: new ObjectId(targetId) }, { $inc: { followersCount: -1 } });
    await db.collection('users').updateOne({ _id: new ObjectId(meId) }, { $inc: { followingCount: -1 } });
  } catch (e) {
    // ignore
  }

  return NextResponse.json({ success: true });
}
