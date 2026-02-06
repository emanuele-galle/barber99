export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Star, Calendar, User, CheckCircle, XCircle } from 'lucide-react'
import { ReviewActions } from '@/components/admin-panel/ReviewActions'
import { SyncReviewsButton } from '@/components/admin-panel/SyncReviewsButton'

async function getReviews() {
  const payload = await getPayload({ config })
  const reviews = await payload.find({
    collection: 'reviews',
    sort: '-createdAt',
    limit: 100,
  })
  return reviews.docs
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'text-[#d4a855] fill-[#d4a855]'
              : 'text-[rgba(255,255,255,0.2)]'
          }`}
        />
      ))}
    </div>
  )
}

export default async function RecensioniPage() {
  const reviews = await getReviews()

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating as number || 0), 0) / reviews.length
      : 0

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Recensioni</h1>
          <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
            Gestisci le recensioni dei clienti
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SyncReviewsButton />
          <div className="admin-card px-4 py-3 flex items-center gap-3">
            <div className="text-2xl font-bold text-[#d4a855]">{avgRating.toFixed(1)}</div>
            <div>
              <StarRating rating={Math.round(avgRating)} />
              <p className="text-xs text-[rgba(255,255,255,0.5)] mt-1">
                {reviews.length} recensioni
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="admin-card p-5">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-[rgba(212,168,85,0.1)] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#d4a855]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{review.author}</h3>
                    <StarRating rating={review.rating as number} />
                    {review.featured ? (
                      <span className="admin-badge admin-badge-success flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        In Evidenza
                      </span>
                    ) : (
                      <span className="admin-badge admin-badge-warning flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Nascosta
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.5)] mb-3">
                    <Calendar className="w-4 h-4" />
                    {new Date(review.createdAt).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>

                  <p className="text-[rgba(255,255,255,0.8)]">{review.text as string}</p>
                </div>

                {/* Actions */}
                <ReviewActions
                  reviewId={String(review.id)}
                  isFeatured={review.featured as boolean}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
            <Star className="w-8 h-8 text-[#d4a855]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nessuna recensione</h3>
          <p className="text-[rgba(255,255,255,0.5)]">
            Non hai ancora ricevuto recensioni
          </p>
        </div>
      )}
    </div>
  )
}
