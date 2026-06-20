import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  addTag,
  getImage,
  imageDataUrl,
  removeTag,
  type ImageSummary,
  type TagOnImage,
} from '../api'
import PageShell from '../components/PageShell'
import TagChip from '../components/TagChip'
import { Loading } from '../components/States'

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

  if (!image) {
    return (
      <PageShell>
        <Loading />
      </PageShell>
    )
  }

  const appliedTags = tags.filter((t) => t.applied)

  return (
    <PageShell>
      <a
        href={imageDataUrl(image.id)}
        className="block overflow-hidden rounded-xl ring-1 ring-gray-200"
      >
        <img
          src={imageDataUrl(image.id)}
          alt={image.filename}
          className="mx-auto max-h-[75vh] w-auto"
        />
      </a>

      <p className="mt-3 text-center text-sm text-gray-500">
        {image.views} {image.views === 1 ? 'view' : 'views'}
      </p>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Tags
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              label={tag.name}
              active={tag.applied}
              onClick={() => toggleTag(tag)}
            />
          ))}
          <form onSubmit={submitNewTag}>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag…"
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm outline-none focus:border-brand"
            />
          </form>
        </div>
      </section>

      {appliedTags.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            See more of
          </h2>
          <div className="flex flex-wrap gap-2">
            {appliedTags.map((tag) => (
              <TagChip key={tag.id} label={tag.name} active to={`/tags/${tag.id}`} />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
