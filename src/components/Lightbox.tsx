'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'motion/react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

interface LightboxImage {
  src: string
  alt: string
  category?: string
}

interface LightboxProps {
  images: LightboxImage[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export default function Lightbox({ images, initialIndex, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null)

  // Reset index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setIsZoomed(false)
    }
  }, [isOpen, initialIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const goToPrevious = useCallback(() => {
    setIsZoomed(false)
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const goToNext = useCallback(() => {
    setIsZoomed(false)
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isZoomed) return

    const threshold = 100
    if (info.offset.x > threshold) {
      goToPrevious()
    } else if (info.offset.x < -threshold) {
      goToNext()
    }
    setDragDirection(null)
  }

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isZoomed) return

    if (info.offset.x > 50) {
      setDragDirection('right')
    } else if (info.offset.x < -50) {
      setDragDirection('left')
    } else {
      setDragDirection(null)
    }
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const currentImage = images[currentIndex]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 lightbox-overlay bg-black/95 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Chiudi lightbox"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Zoom Button */}
          <button
            onClick={toggleZoom}
            className="absolute top-4 right-20 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label={isZoomed ? 'Riduci' : 'Ingrandisci'}
          >
            {isZoomed ? (
              <ZoomOut className="w-6 h-6 text-white" />
            ) : (
              <ZoomIn className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Navigation Arrows - Desktop */}
          <button
            onClick={goToPrevious}
            className="hidden md:flex absolute left-4 z-50 w-14 h-14 rounded-full bg-white/10 hover:bg-[#d4a855]/30 items-center justify-center transition-colors"
            aria-label="Immagine precedente"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-4 z-50 w-14 h-14 rounded-full bg-white/10 hover:bg-[#d4a855]/30 items-center justify-center transition-colors"
            aria-label="Immagine successiva"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          {/* Swipe Direction Indicators - Mobile */}
          <div
            className={`md:hidden absolute left-4 top-1/2 -translate-y-1/2 z-40 transition-opacity ${
              dragDirection === 'right' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#d4a855]/50 flex items-center justify-center">
              <ChevronLeft className="w-6 h-6 text-white" />
            </div>
          </div>
          <div
            className={`md:hidden absolute right-4 top-1/2 -translate-y-1/2 z-40 transition-opacity ${
              dragDirection === 'left' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#d4a855]/50 flex items-center justify-center">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Image Container */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            drag={isZoomed ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className={`relative w-full h-full max-w-5xl max-h-[80vh] mx-4 ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in md:cursor-default'
            }`}
            onClick={(e) => {
              if (e.target === e.currentTarget) return
              toggleZoom()
            }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ scale: isZoomed ? 1.5 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                className="object-contain select-none"
                sizes="(max-width: 768px) 100vw, 80vw"
                priority
                draggable={false}
              />
            </motion.div>
          </motion.div>

          {/* Bottom Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div>
                {currentImage.category && (
                  <span className="text-[#d4a855] text-xs uppercase tracking-wider mb-1 block">
                    {currentImage.category}
                  </span>
                )}
                <p className="text-white text-sm md:text-base">{currentImage.alt}</p>
              </div>

              {/* Dots Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm mr-2">
                  {currentIndex + 1} / {images.length}
                </span>
                <div className="hidden md:flex gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsZoomed(false)
                        setCurrentIndex(index)
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? 'bg-[#d4a855] w-4'
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Vai all'immagine ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Swipe Hint */}
          <div className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs">
            Scorri per navigare
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
