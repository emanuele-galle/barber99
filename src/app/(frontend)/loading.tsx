export default function FrontendLoading() {
  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      {/* Header skeleton */}
      <div className="h-20 bg-[#0c0c0c] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="h-10 w-32 bg-white/5 rounded animate-pulse" />
          <div className="hidden md:flex gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-20 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-10 w-28 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center space-y-4 px-4">
          <div className="h-4 w-24 bg-white/5 rounded mx-auto animate-pulse" />
          <div className="h-12 w-80 bg-white/5 rounded mx-auto animate-pulse" />
          <div className="h-5 w-64 bg-white/5 rounded mx-auto animate-pulse" />
          <div className="h-12 w-48 bg-[#d4a855]/10 rounded-lg mx-auto animate-pulse mt-6" />
        </div>
      </div>
    </div>
  )
}
