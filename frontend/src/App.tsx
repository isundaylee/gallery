import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import ImageList from './pages/ImageList'
import ImageShow from './pages/ImageShow'
import TagsList from './pages/TagsList'
import Review from './pages/Review'
import Duplicates from './pages/Duplicates'

const navLink = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition ${
    isActive ? 'text-brand' : 'text-gray-500 hover:text-gray-900'
  }`

export default function App() {
  return (
    <>
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <NavLink to="/" className="text-lg font-semibold tracking-tight text-gray-900">
            Gallery
          </NavLink>
          <div className="ml-auto flex items-center gap-5">
            <NavLink to="/" end className={navLink}>
              Home
            </NavLink>
            <NavLink to="/recent" className={navLink}>
              Recent
            </NavLink>
            <NavLink to="/tags" className={navLink}>
              Tags
            </NavLink>
            <NavLink to="/review" className={navLink}>
              Review
            </NavLink>
            <NavLink to="/duplicates" className={navLink}>
              Duplicates
            </NavLink>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<ImageList mode="random" />} />
        <Route path="/recent" element={<ImageList mode="recent" />} />
        <Route path="/tags" element={<TagsList />} />
        <Route path="/tags/:tagId" element={<ImageList mode="tag" />} />
        <Route path="/images/:imageId" element={<ImageShow />} />
        <Route path="/review" element={<Review />} />
        <Route path="/duplicates" element={<Duplicates />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
