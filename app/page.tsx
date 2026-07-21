import Link from 'next/link';
import HomeFeedPreview from '../components/HomeFeedPreview';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4 pb-12">
      <div className="mx-auto w-full max-w-3xl text-center pt-20">
        <h1 className="text-6xl font-bold text-orange-600">AQORA</h1>
        <p className="mt-4 text-xl text-gray-700 font-semibold">منصة اجتماعية حقيقية في المتصفح</p>
        <p className="mt-2 text-gray-600 text-lg">أنشئ حساباً ودخّل البيانات الحقيقية لتستعمل التطبيق.</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login" className="inline-flex rounded-full bg-orange-600 px-8 py-3 text-lg font-semibold text-white shadow transition hover:bg-orange-700">
            تسجيل دخول
          </Link>
          <Link href="/register" className="inline-flex rounded-full border-2 border-orange-600 bg-white px-8 py-3 text-lg font-semibold text-orange-600 transition hover:bg-orange-50">
            إنشاء حساب
          </Link>
          <Link href="/dashboard" className="inline-flex rounded-full bg-white/80 px-6 py-3 text-lg font-semibold text-gray-800 shadow-sm hover:bg-white">
            لوحة التحكم
          </Link>
        </div>
      </div>

      <HomeFeedPreview />
    </div>
  );
}
