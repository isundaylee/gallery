import { useEffect, useState } from 'react'
import { listTags, type TagWithCount } from '../api'
import PageShell from '../components/PageShell'
import TagChip from '../components/TagChip'
import { EmptyState, Loading } from '../components/States'

export default function TagsList() {
  const [tags, setTags] = useState<TagWithCount[] | null>(null)

  useEffect(() => {
    listTags().then((data) => setTags(data.tags))
  }, [])

  return (
    <PageShell title="Tags">
      {tags === null ? (
        <Loading />
      ) : tags.length === 0 ? (
        <EmptyState message="No tags yet. Add some from an image." />
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              label={tag.name}
              count={tag.count}
              to={`/tags/${tag.id}`}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}
