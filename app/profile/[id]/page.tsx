import Card from '../../../components/Card';
import FollowButton from '../../../components/FollowButton';

type ProfilePageProps = {
  params: { id: string };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/users?id=${params.id}`, { cache: 'no-store' });
  const data = await res.json();

  return (
    <div className="space-y-6 py-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-white">{data.user?.name || 'مستخدم AQORA'}</h1>
          <FollowButton targetId={data.user?.id} />
        </div>
        <p className="mt-3 max-w-2xl text-slate-300">{data.user?.bio || 'لا توجد معلومات إضافية. استكشف المحتوى وتواصل مع المستخدم.'}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-3xl bg-slate-950 p-5">
            <p className="text-sm text-slate-400">المتابعين</p>
            <p className="mt-2 text-2xl font-semibold text-white">{data.user?.followersCount || 0}</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-5">
            <p className="text-sm text-slate-400">المتابَعون</p>
            <p className="mt-2 text-2xl font-semibold text-white">{data.user?.followingCount || 0}</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-5">
            <p className="text-sm text-slate-400">عدد المنشورات</p>
            <p className="mt-2 text-2xl font-semibold text-white">{data.user?.postsCount || 0}</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-5">
            <p className="text-sm text-slate-400">الحالة</p>
            <p className="mt-2 text-2xl font-semibold text-white">نشط</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">أحدث منشورات المستخدم</h2>
        {data.user?.recentPosts?.length === 0 ? (
          <Card>
            <p className="text-slate-400">لا توجد منشورات حتى الآن.</p>
          </Card>
        ) : (
          data.user.recentPosts.map((post: any) => (
            <Card key={post.id}>
              <p className="text-slate-300">{post.content}</p>
              <p className="mt-3 text-sm text-slate-500">{new Date(post.createdAt).toLocaleString('ar-EG')}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
