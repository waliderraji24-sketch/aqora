'use server';

import { NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../../lib/firebase-admin';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  const verifiedUser = await verifyFirebaseToken(token);
  if (!verifiedUser) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      name: verifiedUser.name,
      email: verifiedUser.email,
    },
  });
}
