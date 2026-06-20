import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listTags, type TagWithCount } from '../api'
import '../styles/tags_list.css'

export default function TagsList() {
  const [tags, setTags] = useState<TagWithCount[]>([])

  useEffect(() => {
    listTags().then((data) => setTags(data.tags))
  }, [])

  return (
    <div className="page-tags">
      <div className="outer-container">
        <ul>
          {tags.map((tag) => (
            <li key={tag.id}>
              <Link to={`/tags/${tag.id}`}>
                {tag.name} ({tag.count})
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
