import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { imageDataUrl, type ImageSummary } from '../api'

// Shared responsive grid wrapper + card-image styling, reused by the home /
// recent / tag listings and by the Review page (same cards, plus tag buttons).
export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{children}</div>
}

export const cardImageClass = 'aspect-square w-full object-cover'

export function ImageGrid({ images }: { images: ImageSummary[] }) {
  return (
    <Grid>
      {images.map((image) => (
        <Link
          key={image.id}
          to={`/images/${image.id}`}
          className="group block overflow-hidden rounded-xl ring-1 ring-gray-200 transition hover:shadow-md hover:ring-gray-300"
        >
          <img
            src={imageDataUrl(image.id)}
            alt={image.filename}
            className={`${cardImageClass} transition duration-200 group-hover:scale-[1.02]`}
          />
        </Link>
      ))}
    </Grid>
  )
}
