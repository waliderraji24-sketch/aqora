import Link from 'next/link';
import HomeFeedPreview from '../components/HomeFeedPreview';

const features = [
  { title: 'منشورات حية', text: 'شارك أفكارك، صورك، أو تحديثاتك في مساحة تفاعلية وجذابة.', icon: '✍️' },
  { title: 'ريلز قصيرة', text: 'محتوى بصري سريع في تنسيق عصري يوائم القصة والرسالة معًا.', icon: '🎬' },
  { title: 'محادثات مباشرة', text: 'تواصل مع الأصدقاء المسجلين داخل تجربة اجتماعية واقعية.', icon: '💬' },
  { title: 'ملف شخصي متكامل', text: 'احتفظ بملفك وبياناتك في واجهة واضحة وسهلة التصفح.', icon: '👤' },
];

export default function Home() {
  return (
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_32%),linear-gradient(135deg,#fff7ed_0%,#fff_42%,#fff5f5_100%)] px-4 pb-12 text-slate-900">
      <div className="mx-auto max-w-7xl pt-8">
        <section className="overflow-hidden rounded-[36px] border border-orange-100 bg-white/85 shadow-[0_20px_80px_-30px_rgba(249,115,22,0.45)] backdrop-blur">
          <div className="grid gap-8 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
            <div className="space-y-6">
              <div className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">AQORA — تجربة اجتماعية أصلية</div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 md:text-5xl">مرحباً بك في AQORA</h1>
                <p className="mt-3 max-w-2xl text-lg text-slate-600">
                  بدل النسخة التقليدية، اختر تجربة مميزة تجمع بين Feed، Reels، Chat، والملف الشخصي في واجهة حديثة تحمل طابعك الخاص.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-3 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-700">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="inline-flex items-center justify-center rounded-full border border-orange-300 bg-white px-7 py-3 text-base font-bold text-orange-700 transition hover:bg-orange-50">
                  إنشاء حساب
                </Link>
                <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-7 py-3 text-base font-bold text-white transition hover:bg-slate-800">
                  لوحة التحكم
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {features.map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-4">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="mt-2 font-black text-slate-900">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-slate-900 p-4 text-white shadow-2xl shadow-slate-900/20">
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black">AQORA Live</div>
                    <div className="text-xs text-slate-300">تجربة قائمة على الواقع، لا على النسخ المباشرة</div>
                  </div>
                  <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">Online</div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-[20px] bg-white/5 p-3">
                    <div className="text-sm font-bold">آخر النشاط</div>
                    <div className="mt-2 text-sm text-slate-300">تحديثات مباشرة، منشورات جديدة، ومحادثات بين الأصدقاء المسجلين.</div>
                  </div>
                  <div className="rounded-[20px] bg-gradient-to-r from-orange-500 to-rose-500 p-4">
                    <div className="text-sm font-bold">اقتراح جديد</div>
                    <div className="mt-1 text-sm text-orange-50">استخدم الفكرة كقاعدة، ثم أضف هوية علامتك الخاصة في التصميم النهائي.</div>
                  </div>
                  <div className="rounded-[20px] bg-white/5 p-3">
                    <div className="text-sm font-bold">التفاعل</div>
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
                      <span>إعجابات</span>
                      <span>تعليقات</span>
                      <span>محادثات</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HomeFeedPreview />
      </div>
    </div>
  );
}
