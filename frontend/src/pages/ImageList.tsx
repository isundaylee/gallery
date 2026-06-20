import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { listImages, imageDataUrl, type ImageSummary } from '../api'
import '../styles/image_list.css'

// Backs three routes that all render the same grid: the random homepage,
// the paginated "recent" feed, and the per-tag listing.
type Mode = 'random' | 'recent' | 'tag'

export default function ImageList({ mode }: { mode: Mode }) {
  const { tagId } = useParams()
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 0)

  const [title, setTitle] = useState('')
  const [images, setImages] = useState<ImageSummary[]>([])

  useEffect(() => {
    const params =
      mode === 'tag'
        ? { tag: Number(tagId) }
        : mode === 'recent'
          ? { mode: 'recent' as const, page }
          : { mode: 'random' as const }
    listImages(params).then((data) => {
      setTitle(data.title)
      setImages(data.images)
    })
  }, [mode, tagId, page])

  return (
    <div className="page-list">
      <div className="outer-container">
        <h1>{title}</h1>

        {images.map((image) => (
          <Link key={image.id} to={`/images/${image.id}`}>
            <img
              className="image-item"
              src={imageDataUrl(image.id)}
              alt={image.filename}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
