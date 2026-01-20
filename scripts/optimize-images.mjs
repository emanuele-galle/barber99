#!/usr/bin/env node
import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import { join, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const IMAGES_DIR = join(__dirname, '../public/images')
const QUALITY_JPEG = 80
const QUALITY_WEBP = 80

// Images to optimize with their target sizes
const imagesToOptimize = [
  { name: 'rasatura-barba.png', maxWidth: 800, format: 'webp' },
  { name: 'taglio-capelli-gallery.png', maxWidth: 800, format: 'webp' },
  { name: 'hero-bg.jpg', maxWidth: 1920, format: 'jpeg', quality: 75 },
  { name: 'gallery-2.png', maxWidth: 600, format: 'webp' },
  { name: 'gallery-4.png', maxWidth: 600, format: 'webp' },
  // Additional images to optimize
  { name: 'gallery-1.jpg', maxWidth: 800, format: 'webp' },
  { name: 'gallery-3.jpg', maxWidth: 800, format: 'webp' },
  { name: 'barba-macchinetta.jpg', maxWidth: 800, format: 'webp' },
  { name: 'pennello-barbiere.jpg', maxWidth: 800, format: 'webp' },
  { name: 'logo.png', maxWidth: 300, format: 'webp' },
]

async function getFileSize(filePath) {
  const stats = await stat(filePath)
  return stats.size
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

async function optimizeImage(config) {
  const inputPath = join(IMAGES_DIR, config.name)
  const ext = extname(config.name)
  const baseName = basename(config.name, ext)

  // Output path - keep original extension for JPEG, use .webp for WebP
  const outputExt = config.format === 'webp' ? '.webp' : ext
  const outputPath = join(IMAGES_DIR, `${baseName}${outputExt}`)

  try {
    const originalSize = await getFileSize(inputPath)
    console.log(`\nProcessing: ${config.name}`)
    console.log(`  Original: ${formatBytes(originalSize)}`)

    let pipeline = sharp(inputPath)

    // Get metadata to check dimensions
    const metadata = await pipeline.metadata()
    console.log(`  Dimensions: ${metadata.width}x${metadata.height}`)

    // Resize if needed
    if (metadata.width > config.maxWidth) {
      pipeline = pipeline.resize(config.maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      console.log(`  Resizing to max width: ${config.maxWidth}px`)
    }

    // Convert to target format
    if (config.format === 'webp') {
      pipeline = pipeline.webp({ quality: config.quality || QUALITY_WEBP })
    } else if (config.format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: config.quality || QUALITY_JPEG, mozjpeg: true })
    }

    // If converting to WebP from another format, save to new path
    // Otherwise overwrite
    const finalOutputPath = config.format === 'webp' && ext !== '.webp'
      ? join(IMAGES_DIR, `${baseName}.webp`)
      : inputPath

    await pipeline.toFile(finalOutputPath + '.tmp')

    // Get new size
    const newSize = await getFileSize(finalOutputPath + '.tmp')
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1)

    console.log(`  Optimized: ${formatBytes(newSize)} (${savings}% smaller)`)

    // Replace original with optimized version
    const { rename, unlink } = await import('fs/promises')

    if (config.format === 'webp' && ext !== '.webp') {
      // Keep original, create new WebP
      await rename(finalOutputPath + '.tmp', finalOutputPath)
      console.log(`  Created: ${baseName}.webp`)
    } else {
      // Replace original
      await unlink(inputPath)
      await rename(finalOutputPath + '.tmp', inputPath)
      console.log(`  Replaced: ${config.name}`)
    }

    return { success: true, saved: originalSize - newSize }
  } catch (error) {
    console.error(`  Error: ${error.message}`)
    return { success: false, saved: 0 }
  }
}

async function main() {
  console.log('Image Optimization Script')
  console.log('='.repeat(50))

  let totalSaved = 0

  for (const config of imagesToOptimize) {
    const result = await optimizeImage(config)
    if (result.success) {
      totalSaved += result.saved
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`Total space saved: ${formatBytes(totalSaved)}`)
}

main().catch(console.error)
