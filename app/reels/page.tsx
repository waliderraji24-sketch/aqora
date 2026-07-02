import Card from '../../components/Card';
import Link from 'next/link';

const reels = [
  { id: 'r1', title: 'نصائح للإنتاجية', description: 'أفضل الطرق لتحسين إنتاجيتك', icon: '🎬', views: 1200, likes: 340 },
  { id: 'r2', title: 'تعلم البرمجة', description: 'شرح سريع لأساسيات البرمجة', icon: '💻', views: 3450, likes: 890 },
  { id: 'r3', title: 'رحلة سياحية', description: 'أجمل الأماكن السياحية', icon: '🏖️', views: 2100, likes: 560 },
];

export default function ReelsPage() {
  return (
    <div className="space-y-6 py-6">
      <Card>
        <h1 className="text-2xl font-semibold text-white">Reels - فيديوهات قصيرة</h1>
        <p className="mt-2 text-sm text-slate-400">واجهة الفيديوهات القصيرة للتفاعل والإلهام.</p>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {reels.map((reel) => (
          <div key={reel.id} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-soft overflow-hidden hover:shadow-lg transition">
            <div className="relative w-full aspect-video bg-slate-950 rounded-3xl flex items-center justify-center mb-4">
              <div className="text-6xl">{reel.icon}</div>
            </div>
            <h2 className="text-lg font-semibold text-white">{reel.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{reel.description}</p>
            <div className="mt-4 flex items-center justify-between text-slate-500 text-sm">
              <span>👁️ {reel.views.toLocaleString()}</span>
              <span>❤️ {reel.likes.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-white">شارك فيديوك الخاص</h3>
        <p className="mt-2 text-slate-400">قريباً: سيكون يمكنك تحميل فيديوهات قصيرة مباشرة من AQORA</p>
        <button className="mt-4 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
          تحميل فيديو
        </button>
      </Card>
    </div>
  );
}
