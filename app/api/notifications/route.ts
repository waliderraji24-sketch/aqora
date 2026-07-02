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

  const client = await connectMongo();
  const db = client.db();

  const notifications = await db
    .collection('notifications')
    .find({ userId: payload.id as string })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  // احصل على بيانات المستخدمين المرسلين للإشعارات
  const enrichedNotifications = await Promise.all(
    notifications.map(async (notif) => {
      let message = '';
      let title = '';

      switch (notif.type) {
        case 'follow':
          title = 'متابع جديد';
          message = 'بدأ بمتابعتك';
          break;
        case 'like':
          title = 'إعجاب جديد';
          message = 'أعجب بأحد منشوراتك';
          break;
        case 'comment':
          title = 'تعليق جديد';
          message = 'أضاف تعليقاً على منشورك';
          break;
        default:
          title = 'إشعار جديد';
          message = 'لديك إشعار جديد';
      }

      let fromUserName = 'مستخدم';
      if (notif.fromUserId) {
        const fromUser = await db
          .collection('users')
          .findOne({ _id: new ObjectId(notif.fromUserId) });
        if (fromUser) {
          fromUserName = fromUser.name;
        }
      }

      return {
        id: notif._id.toString(),
        title,
        message,
        createdAt: notif.createdAt,
        type: notif.type,
        fromUserId: notif.fromUserId,
        fromUserName,
        read: notif.read || false,
      };
    })
  );

  return NextResponse.json({ notifications: enrichedNotifications });
}
