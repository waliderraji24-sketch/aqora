import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '../../../../lib/mongodb';
import { signToken } from '../../../../lib/jwt';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();
  const user = await db.collection('users').findOne({ email });

  if (!user) {
    return NextResponse.json({ message: 'بيانات تسجيل الدخول غير صحيحة.' }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return NextResponse.json({ message: 'بيانات تسجيل الدخول غير صحيحة.' }, { status: 401 });
  }

  const token = signToken({ id: user._id.toString(), email: user.email, name: user.name });

  return NextResponse.json({
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio,
      followersCount: user.followersCount ?? 0,
      postsCount: user.postsCount ?? 0,
    },
  });
}
