'use client'

import { motion } from 'motion/react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'bg-white/5 animate-pulse'

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const style = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'text' ? '1em' : undefined),
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

// Pre-built skeleton layouts
export function ServiceCardSkeleton() {
  return (
    <div className="card-dark p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton variant="rectangular" className="w-14 h-14" />
        <div className="text-right space-y-2">
          <Skeleton variant="text" className="w-16 h-6" />
          <Skeleton variant="text" className="w-12 h-4" />
        </div>
      </div>
      <Skeleton variant="text" className="w-3/4 h-6" />
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-5/6 h-4" />
      <Skeleton variant="rectangular" className="w-full h-10 mt-4" />
    </div>
  )
}

export function GalleryImageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-lg aspect-square"
    >
      <Skeleton variant="rectangular" className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
    </motion.div>
  )
}

export function ReviewCardSkeleton() {
  return (
    <div className="card-dark p-6 space-y-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="circular" className="w-4 h-4" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-3/4 h-4" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-1">
          <Skeleton variant="text" className="w-24 h-4" />
          <Skeleton variant="text" className="w-16 h-3" />
        </div>
        <Skeleton variant="rectangular" className="w-16 h-6 rounded-full" />
      </div>
    </div>
  )
}

export function TeamMemberSkeleton() {
  return (
    <div className="card-dark p-6 text-center space-y-4">
      <Skeleton variant="circular" className="w-32 h-32 mx-auto" />
      <Skeleton variant="text" className="w-24 h-6 mx-auto" />
      <Skeleton variant="text" className="w-20 h-4 mx-auto" />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full h-3" />
        <Skeleton variant="text" className="w-4/5 h-3 mx-auto" />
      </div>
    </div>
  )
}
