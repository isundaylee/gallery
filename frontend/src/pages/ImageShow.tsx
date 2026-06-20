import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addTag,
  getImage,
  imageDataUrl,
  removeTag,
  type ImageSummary,
  type TagOnImage,
} from '../api'
import '../styles/show.css'

export default function ImageShow() {
  const { imageId } = useParams()
  const id = Number(imageId)

  const [image, setImage] = useState<ImageSummary | null>(null)
  const [tags, setTags] = useState<TagOnImage[]>([])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    getImage(id).then((data) => {
      setImage(data.image)
      setTags(data.tags)
    })
  }, [id])

  // Reload tags after a mutation so ordering (applied-first) stays correct.
  const refreshTags = () => getImage(id).then((data) => setTags(data.tags))

  const toggleTag = async (tag: TagOnImage) => {
    if (tag.applied) {
      await removeTag(id, tag.id)
    } else {
      await addTag(id, { tag_id: tag.id })
    }
    await refreshTags()
  }

  const submitNewTag = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newTag.trim()
    if (!name) return
    await addTag(id, { name })
    setNewTag('')
    await refreshTags()
  }

  if (!image) return null

  return (
    <div className="page-show">
      <div className="outer-container">
        <a href={imageDataUrl(image.id)}>
          <img className="image" src={imageDataUrl(image.id)} alt={image.filename} />
        </a>

        <p className="viewcount">{image.views} views</p>

        <div className="tags-container">
          <Link to="/tags">Tags:</Link>
          {tags.map((tag) => (
            <span
              key={tag.id}
              className={`tag ${tag.applied ? 'tag-on' : 'tag-off'}`}
              onClick={() => toggleTag(tag)}
            >
              {tag.name}
            </span>
          ))}
          <form onSubmit={submitNewTag}>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
          </form>
        </div>

        <div className="tags-container">
          <Link to="/tags">See More Of:</Link>
          {tags
            .filter((tag) => tag.applied)
            .map((tag) => (
              <Link key={tag.id} to={`/tags/${tag.id}`}>
                <span className="tag tag-on">{tag.name}</span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
