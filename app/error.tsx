'use client';

export default function Error({
  reset,
}: {
  error: globalThis.Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full border border-[#27272a] bg-[#121215] p-8 rounded-xl space-y-4">
        <span className="font-mono text-xs uppercase px-2.5 py-1 rounded bg-[#27272a] text-[#ef4444] border border-[#3f3f46]">
          ERROR // 500
        </span>
        <h1 className="text-xl font-bold font-sans">خطای سیستمی در مدار</h1>
        <p className="text-sm text-[#a1a1aa] font-sans">
          خطایی در پردازش رخ داد. لطفاً دوباره تلاش کنید.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] text-sm text-[#fafafa] transition-colors font-sans"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    </div>
  );
}
