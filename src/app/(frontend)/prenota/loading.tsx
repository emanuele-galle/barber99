export default function PrenotaLoading() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] pt-24">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-12">
        {/* Title skeleton */}
        <div className="text-center mb-6 md:mb-12 space-y-3">
          <div className="h-4 w-20 bg-white/5 rounded mx-auto animate-pulse hidden md:block" />
          <div className="h-10 w-72 bg-white/5 rounded mx-auto animate-pulse" />
          <div className="h-4 w-96 bg-white/5 rounded mx-auto animate-pulse hidden md:block" />
        </div>

        {/* Booking form skeleton */}
        <div className="bg-white/5 rounded-2xl p-6 md:p-8 space-y-6">
          {/* Service selection */}
          <div className="space-y-3">
            <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Calendar skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
          </div>

          {/* Time slots skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-20 bg-white/5 rounded animate-pulse" />
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Submit button skeleton */}
          <div className="h-12 w-full bg-[#d4a855]/10 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}
