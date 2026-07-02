export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft">{children}</div>;
}
