export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-72 bg-white/5 rounded animate-pulse" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 space-y-3">
            <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
            <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 rounded-xl p-6 space-y-4">
          <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
              <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse ml-auto" />
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl p-6 space-y-4">
          <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
