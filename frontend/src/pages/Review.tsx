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
import '../styles/review.css'

export default function Review() {
  const [images, setImages] = useState<ReviewImage[]>([])
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
      prev.map((i) =>
        i.id === image.id
          ? {
              ...i,
              tag_ids: applied
                ? i.tag_ids.filter((t) => t !== tag.id)
                : [...i.tag_ids, tag.id],
            }
          : i,
      ),
    )
  }

  const onMarkReviewed = async (e: React.FormEvent) => {
    e.preventDefault()
    await markReviewed(images.map((i) => i.id))
    await load()
  }

  return (
    <div className="page-review">
      <div className="outer-container">
        <h1>Review Images</h1>

        <form onSubmit={onMarkReviewed}>
          {images.map((image) => (
            <div className="review-row" key={image.id}>
              <div className="image-container">
                <img
                  className="image-thumbnail"
                  src={imageDataUrl(image.id)}
                  alt={image.filename}
                />
              </div>

              <div className="tags-container">
                {tags.map((tag) => {
                  const applied = image.tag_ids.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={`tag-button ${applied ? 'tag-on' : 'tag-off'}`}
                      onClick={() => toggleTag(image, tag)}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <button type="submit" className="mark-reviewed-button">
            Mark All as Reviewed
          </button>
        </form>
      </div>
    </div>
  )
}
