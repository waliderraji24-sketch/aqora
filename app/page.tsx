import Link from 'next/link';
import Card from '../components/Card';

export default function HomePage() {
  return (
    <div className="space-y-12 py-12">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full bg-brand-500/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-brand-100">
            منصة تواصل اجتماعي متكاملة
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            AQORA — منصة اجتماعية عالمية ذكية قابلة للتوسع.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            منصة تجمع بين Feed، Reels، Chat، Communities و AI Recommendations مع واجهة حديثة وخدمة Backend حقيقية متصلة بقاعدة بيانات MongoDB.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register" className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700">
              إنشاء حساب
            </Link>
            <Link href="/login" className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-brand-500 hover:text-white">
              تسجيل دخول
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] bg-slate-900/90 p-8 shadow-soft ring-1 ring-slate-700/50">
          <div className="space-y-5">
            <div className="rounded-3xl bg-slate-950 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white">خمس خصائص أساسية</h2>
              <ul className="mt-4 space-y-3 text-slate-300">
                <li>• فيد ذكي مع توصيات AI.</li>
                <li>• Reels وفيديوهات قصيرة.</li>
                <li>• دردشة فورية ومجموعات.</li>
                <li>• لوحة تحكم Admin لإدارة المحتوى.</li>
                <li>• دعم متعدد اللغات وتصميم متجاوب.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Feed متقدم', description: 'محتوى مخصص مع دعم نشر منشورات ونظام تفاعلي.' },
          { title: 'Reels', description: 'واجهة فيديوهات قصيرة مع نظام مشاهدة سريع.' },
          { title: 'دردشة مباشرة', description: 'رسائل فردية وجماعية مع إشعارات فورية.' },
          { title: 'لوحة إدارة', description: 'إدارة المستخدمين والمحتوى وتقارير النظام.' },
        ].map((card) => (
          <Card key={card.title}>
            <h3 className="text-xl font-semibold text-white">{card.title}</h3>
            <p className="mt-3 text-slate-300">{card.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
