'use server';

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');

  if (!auth?.startsWith('Bearer fake-token:')) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  const email = auth.replace('Bearer fake-token:', '').trim();
  const name = email.split('@')[0] || 'مصمم';

  return NextResponse.json({
    user: {
      name,
      email,
    },
  });
}
