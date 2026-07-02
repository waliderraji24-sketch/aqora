import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '../../../../lib/mongodb';
import { signToken } from '../../../../lib/jwt';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'جميع الحقول مطلوبة.' }, { status: 400 });
  }

  const client = await connectMongo();
  const db = client.db();

  const existingUser = await db.collection('users').findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'هذا البريد الإلكتروني مستخدم بالفعل.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const createdAt = new Date();
  const newUser = {
    name,
    email,
    bio: 'مرحباً بك في AQORA! عدّل ملفك الشخصي وابدأ النشر.',
    passwordHash,
    followersCount: 0,
    postsCount: 0,
    createdAt,
    updatedAt: createdAt,
  };

  const result = await db.collection('users').insertOne(newUser);
  const token = signToken({ id: result.insertedId.toString(), email, name });

  return NextResponse.json({
    token,
    user: {
      id: result.insertedId.toString(),
      name,
      email,
      bio: newUser.bio,
      followersCount: 0,
      postsCount: 0,
    },
  }, { status: 201 });
}
