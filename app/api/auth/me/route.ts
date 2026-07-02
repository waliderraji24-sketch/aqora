import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/jwt';
import connectMongo from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'يجب تسجيل الدخول.' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  if (!payload?.id) {
    return NextResponse.json({ message: 'رمز المصادقة غير صالح.' }, { status: 401 });
  }

  const client = await connectMongo();
  const db = client.db();
  const user = await db.collection('users').findOne({ _id: new ObjectId(payload.id as string) }, { projection: { passwordHash: 0 } });

  if (!user) {
    return NextResponse.json({ message: 'المستخدم غير موجود.' }, { status: 404 });
  }

  return NextResponse.json({ user: { id: user._id.toString(), name: user.name, email: user.email, bio: user.bio, followersCount: user.followersCount ?? 0, postsCount: user.postsCount ?? 0 } });
}
