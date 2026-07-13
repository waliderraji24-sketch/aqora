import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-6xl font-bold text-orange-600">AQORA</h1>
        <p className="mt-4 text-xl text-gray-700 font-semibold">منصة اجتماعية حقيقية في المتصفح</p>
        <p className="mt-2 text-gray-600 text-lg">أنشئ حساباً ودخّل البيانات الحقيقية لتستعمل التطبيق.</p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex rounded-full bg-orange-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
          >
            تسجيل دخول
          </Link>
          <Link
            href="/register"
            className="inline-flex rounded-full border-2 border-orange-600 bg-white px-10 py-4 text-lg font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            إنشاء حساب
          </Link>
        </div>
      </div>
    </div>
  );
}
