'use server';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || !body.email || !body.password) {
    return NextResponse.json({ message: 'البيانات غير مكتملة' }, { status: 400 });
  }

  const email = String(body.email).trim();
  const password = String(body.password).trim();

  if (!email || !password) {
    return NextResponse.json({ message: 'البريد أو كلمة المرور فارغة' }, { status: 400 });
  }

  const name = email.split('@')[0] || 'مصمم';
  const token = `fake-token:${email}`;

  return NextResponse.json({
    token,
    user: {
      name,
      email,
    },
  });
}
