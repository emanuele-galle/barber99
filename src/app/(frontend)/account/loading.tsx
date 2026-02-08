export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-white/5 rounded-lg animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Appointments list skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-40 bg-white/5 rounded animate-pulse mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="h-12 w-12 bg-white/5 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-white/5 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
