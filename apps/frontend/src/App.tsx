import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/analyst/Dashboard';
import { IdeasList } from './pages/analyst/IdeasList';
import { IdeaDetail } from './pages/analyst/IdeaDetail';
import { MyIdeas } from './pages/participant/MyIdeas';
import { CreateIdea } from './pages/participant/CreateIdea';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminIdeas } from './pages/admin/AdminIdeas';
import { AdminVerticals } from './pages/admin/AdminVerticals';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

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
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ideas" element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}><IdeasList /></ProtectedRoute>} />
          <Route path="/ideas/:id" element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}><IdeaDetail /></ProtectedRoute>} />
          <Route path="/my-ideas" element={<ProtectedRoute allowedRoles={['PARTICIPANT', 'ANALYST', 'ADMIN']}><MyIdeas /></ProtectedRoute>} />
          <Route path="/ideas/new" element={<ProtectedRoute allowedRoles={['PARTICIPANT', 'ANALYST', 'ADMIN']}><CreateIdea /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/ideas" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminIdeas /></ProtectedRoute>} />
          <Route path="/admin/verticals" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminVerticals /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;