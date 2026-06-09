import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { BrowsePage } from './pages/BrowsePage'
import { ModelsPage } from './pages/ModelsPage'
import { ModelDetailPage } from './pages/ModelDetailPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { CategoryDetailPage } from './pages/CategoryDetailPage'
import { SearchPage } from './pages/SearchPage'
import { AccountPage } from './pages/AccountPage'
import { MegaPage } from './pages/MegaPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><BrowsePage /></Layout>} />
        <Route path="/models" element={<Layout><ModelsPage /></Layout>} />
        <Route path="/model/:slug" element={<Layout><ModelDetailPage /></Layout>} />
        <Route path="/posts" element={<Navigate to="/" replace />} />
        <Route path="/post/:slug" element={<Layout><PostDetailPage /></Layout>} />
        <Route path="/single/:slug" element={<Navigate to="/post/:slug" replace />} />
        <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
        <Route path="/category/:slug" element={<Layout><CategoryDetailPage /></Layout>} />
        <Route path="/search" element={<Layout><SearchPage /></Layout>} />
        <Route path="/account" element={<Layout><AccountPage /></Layout>} />
        <Route path="/mega" element={<Layout><MegaPage /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
