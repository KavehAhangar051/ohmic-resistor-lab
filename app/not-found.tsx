import Link from 'next/link';

export default function NotFound() {
  return (
    <main dir="rtl" lang="fa" className="min-h-dvh bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full border border-[#27272a] bg-[#121215] lab-panel p-8 rounded-xl space-y-4">
        <span dir="ltr" className="inline-block font-mono text-xs uppercase px-2.5 py-1 rounded-md bg-[#27272a]/80 text-[#10b981] border border-[#3f3f46] tracking-wider">
          404 // NODE DISCONNECTED
        </span>
        <h1 className="text-xl font-bold font-sans text-balance">صفحه مورد نظر یافت نشد</h1>
        <p className="text-sm text-[#a1a1aa] font-sans leading-relaxed text-pretty max-w-[42ch] mx-auto">
          مدار یا مسیر درخواستی در سامانه آزمایشگاه وجود ندارد یا اتصال آن قطع شده است.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] text-sm font-medium text-[#fafafa] transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 font-sans"
          >
            بازگشت به میز کار آزمایشگاه
          </Link>
        </div>
      </div>
    </main>
  );
}
