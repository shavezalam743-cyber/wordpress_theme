import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { ProtectedRoute } from './components/ProtectedRoute'
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
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'

function App() {
  return (
    <AuthProvider>
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
          <Route path="/login" element={<Layout><LoginPage /></Layout>} />
          <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
          <Route path="/forgot-password" element={<Layout><ForgotPasswordPage /></Layout>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
