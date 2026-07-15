import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/analyst/Dashboard';
import { IdeasList } from './pages/analyst/IdeasList';
import { IdeaDetail } from './pages/analyst/IdeaDetail';
import { MyIdeas } from './pages/participant/MyIdeas';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function LayoutWrapper() {
  return <Layout><Outlet /></Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#fff', color: '#333', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<LayoutWrapper />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ideas" element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}><IdeasList /></ProtectedRoute>} />
          <Route path="/ideas/:id" element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}><IdeaDetail /></ProtectedRoute>} />
          <Route path="/my-ideas" element={<ProtectedRoute allowedRoles={['PARTICIPANT', 'ANALYST', 'ADMIN']}><MyIdeas /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;