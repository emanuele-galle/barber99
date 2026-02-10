'use client'

import { motion } from 'motion/react'
import { Star } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'

interface GoogleReviewsBadgeProps {
  averageRating: number
  reviewCount: number
}

export default function GoogleReviewsBadge({
  averageRating,
  reviewCount,
}: GoogleReviewsBadgeProps) {
  const isMobile = useIsMobile()

  // Hide on mobile (MobileNav already exists)
  if (isMobile) return null

  const googleReviewUrl =
    'https://search.google.com/local/writereview?placeid=ChIJh15YSTVFFRMR0Q84QLNKtP4'

  return (
    <motion.a
      href={googleReviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 group cursor-pointer"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.6,
        delay: 3,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-[#d4a855]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Badge container */}
      <div className="relative bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-2xl hover:border-[#d4a855]/30 transition-all duration-300">
        <div className="flex items-center gap-3">
          {/* Google G logo */}
          <div className="flex-shrink-0">
            <svg
              width="32"
              height="32"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
          </div>

          {/* Rating info */}
          <div className="flex flex-col gap-1">
            {/* Stars and rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(averageRating)
                        ? 'fill-[#d4a855] text-[#d4a855]'
                        : 'text-white/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white font-semibold text-sm">
                {averageRating.toFixed(1)}
              </span>
            </div>

            {/* Review count */}
            <div className="text-white/60 text-xs font-medium">
              {reviewCount}+ recensioni
            </div>
          </div>
        </div>
      </div>
    </motion.a>
  )
}
