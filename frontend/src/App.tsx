import { Link, Navigate, Route, Routes } from 'react-router-dom'
import ImageList from './pages/ImageList'
import ImageShow from './pages/ImageShow'
import TagsList from './pages/TagsList'
import Review from './pages/Review'

export default function App() {
  return (
    <>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/recent">Recent</Link>
        <Link to="/tags">Tags</Link>
        <Link to="/review">Review</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ImageList mode="random" />} />
        <Route path="/recent" element={<ImageList mode="recent" />} />
        <Route path="/tags" element={<TagsList />} />
        <Route path="/tags/:tagId" element={<ImageList mode="tag" />} />
        <Route path="/images/:imageId" element={<ImageShow />} />
        <Route path="/review" element={<Review />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
