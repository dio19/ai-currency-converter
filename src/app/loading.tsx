function LoadingBar() {
  return <div className="h-3 w-28 rounded-full bg-white/30" aria-hidden="true" />;
}

function LoadingCard() {
  return (
    <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 relative overflow-hidden ring-1 ring-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-10">
        <div className="md:col-span-3 space-y-3">
          <LoadingBar />
          <div className="h-12 rounded-md bg-gray-100" />
          <div className="h-4 w-48 rounded-full bg-gray-100" />
        </div>

        <div className="md:col-span-4 space-y-3">
          <LoadingBar />
          <div className="h-12 rounded-md bg-gray-100" />
        </div>

        <div className="md:col-span-1 flex justify-center md:pt-8">
          <div className="h-10 w-10 rounded-full bg-gray-100" />
        </div>

        <div className="md:col-span-4 space-y-3">
          <LoadingBar />
          <div className="h-12 rounded-md bg-gray-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="h-8 w-56 rounded-full bg-gray-100" />
          <div className="h-12 w-80 rounded-full bg-gray-100" />
          <div className="h-4 w-40 rounded-full bg-gray-100" />
          <div className="h-4 w-36 rounded-full bg-gray-100" />
        </div>

        <div className="rounded-xl border border-[#d1d1ff] bg-[#e1e1ff] p-6">
          <div className="h-20 rounded-lg bg-white/40" />
        </div>
      </div>

      <div className="mt-10 border-t border-gray-50 pt-4 flex justify-end">
        <div className="h-4 w-64 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite">
      <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#2e3333]">
        <nav className="h-12 bg-[#0c102a] flex items-center px-4 md:px-20 text-white font-bold text-sm">
          Currency Converter
        </nav>

        <div className="bg-[#5f37ff] h-64 flex flex-col items-center justify-center text-white px-4 relative">
          <div className="h-10 w-80 max-w-full rounded-full bg-white/20" />
        </div>

        <div className="max-w-6xl mx-auto -mt-24 px-4 relative z-10 pb-20">
          <LoadingCard />
        </div>
      </div>
    </main>
  );
}
