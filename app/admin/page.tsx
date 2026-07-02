import Card from '../../components/Card';

export default function AdminPage() {
  return (
    <div className="space-y-6 py-6">
      <Card>
        <h1 className="text-2xl font-semibold text-white">لوحة الإدارة</h1>
        <p className="mt-2 text-sm text-slate-400">إدارة حسابات المستخدمين والمحتوى والأنشطة.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold text-white">إدارة المستخدمين</h2>
          <p className="mt-3 text-slate-300">عرض المستخدمين وحظر الحسابات عند الحاجة.</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-white">محتوى وتقرير</h2>
          <p className="mt-3 text-slate-300">راجع البلاغات والتقارير ونشاط النظام.</p>
        </Card>
      </div>
    </div>
  );
}
