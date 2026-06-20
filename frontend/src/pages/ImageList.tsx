import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { listImages, type ImageSummary } from '../api'
import PageShell from '../components/PageShell'
import { ImageGrid } from '../components/ImageGrid'
import { EmptyState, Loading } from '../components/States'

// Backs three routes that all render the same grid: the random homepage,
// the paginated "recent" feed, and the per-tag listing.
type Mode = 'random' | 'recent' | 'tag'

export default function ImageList({ mode }: { mode: Mode }) {
  const { tagId } = useParams()
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 0)

  const [title, setTitle] = useState('')
  const [images, setImages] = useState<ImageSummary[] | null>(null)

  useEffect(() => {
    setImages(null)
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
    <PageShell title={images ? title : ''}>
      {images === null ? (
        <Loading />
      ) : images.length === 0 ? (
        <EmptyState message="No images here yet." />
      ) : (
        <ImageGrid images={images} />
      )}
    </PageShell>
  )
}
