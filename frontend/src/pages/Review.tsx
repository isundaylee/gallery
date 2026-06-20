import { useEffect, useState } from 'react'
import {
  addTag,
  getReview,
  imageDataUrl,
  markReviewed,
  removeTag,
  type NamedTag,
  type ReviewImage,
} from '../api'
import PageShell from '../components/PageShell'
import TagChip from '../components/TagChip'
import { Grid, cardImageClass } from '../components/ImageGrid'
import { EmptyState, Loading } from '../components/States'

export default function Review() {
  const [images, setImages] = useState<ReviewImage[] | null>(null)
  const [tags, setTags] = useState<NamedTag[]>([])

  const load = () =>
    getReview().then((data) => {
      setImages(data.images)
      setTags(data.tags)
    })

  useEffect(() => {
    load()
  }, [])

  const toggleTag = async (image: ReviewImage, tag: NamedTag) => {
    const applied = image.tag_ids.includes(tag.id)
    if (applied) {
      await removeTag(image.id, tag.id)
    } else {
      await addTag(image.id, { tag_id: tag.id })
    }
    // Update just this image's tag set locally to avoid a full reload.
    setImages((prev) =>
      prev?.map((i) =>
        i.id === image.id
          ? {
              ...i,
              tag_ids: applied
                ? i.tag_ids.filter((t) => t !== tag.id)
                : [...i.tag_ids, tag.id],
            }
          : i,
      ) ?? prev,
    )
  }

  const onMarkReviewed = async () => {
    if (!images) return
    await markReviewed(images.map((i) => i.id))
    await load()
  }

  if (images === null) {
    return (
      <PageShell title="Review">
        <Loading />
      </PageShell>
    )
  }

  return (
    <PageShell title="Review">
      {images.length === 0 ? (
        <EmptyState message="Nothing left to review. 🎉" />
      ) : (
        <>
          {/* Bottom padding reserves space so the floating button never
              covers the last row's tag buttons when scrolled to the end. */}
          <div className="pb-28">
            <Grid>
              {images.map((image) => (
              <div key={image.id} className="flex flex-col gap-3">
                <div className="overflow-hidden rounded-xl ring-1 ring-gray-200">
                  <img
                    src={imageDataUrl(image.id)}
                    alt={image.filename}
                    className={cardImageClass}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagChip
                      key={tag.id}
                      label={tag.name}
                      active={image.tag_ids.includes(tag.id)}
                      onClick={() => toggleTag(image, tag)}
                    />
                  ))}
                </div>
              </div>
              ))}
            </Grid>
          </div>

          {/* Stays on screen while scrolling the queue. */}
          <button
            type="button"
            onClick={onMarkReviewed}
            className="fixed bottom-6 right-6 z-20 rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-brand-hover"
          >
            Mark all reviewed
          </button>
        </>
      )}
    </PageShell>
  )
}
