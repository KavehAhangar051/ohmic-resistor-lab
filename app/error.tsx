'use client';

export default function Error({
  reset,
}: {
  error: globalThis.Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-dvh bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full border border-[#27272a] bg-[#121215] lab-panel p-8 rounded-xl space-y-4">
        <span className="inline-block font-mono text-xs uppercase px-2.5 py-1 rounded-md bg-[#27272a]/80 text-[#ef4444] border border-[#3f3f46] tracking-wider">
          ERROR // 500
        </span>
        <h1 className="text-xl font-bold font-sans text-balance">خطای سیستمی در مدار</h1>
        <p className="text-sm text-[#a1a1aa] font-sans leading-relaxed text-pretty max-w-[42ch] mx-auto">
          محاسبه مداری با وقفه مواجه شد. لطفاً وضعیت ورودی‌ها را بازنشانی و دوباره تلاش کنید.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] text-sm font-medium text-[#fafafa] transition-[color,background-color,border-color,transform] duration-200 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 font-sans"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    </div>
  );
}
