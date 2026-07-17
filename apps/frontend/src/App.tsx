import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/analyst/Dashboard';
import { IdeasList } from './pages/analyst/IdeasList';
import { IdeaDetail } from './pages/analyst/IdeaDetail';
import { MyIdeas } from './pages/participant/MyIdeas';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AdminIdeasOverview } from './pages/admin/AdminIdeasOverview';
import { AdminSettings } from './pages/admin/AdminSettings';
import { CrmDashboard, CompaniesList, ContactsList, DealsList, ActivitiesList } from './pages/crm';
import { VerticalsManagement } from './pages/verticals/VerticalsManagement';
import { PostMortemsList, PostMortemDetail } from './pages/post-mortem';
import { UserProfile } from './pages/profile';
import { ProjectsList, ProjectDetail, NewProject } from './pages/projects';
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
          <Route path="/ideas/new" element={<Navigate to="/projects/new" replace />} />
          <Route path="/ideas/:id" element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}><IdeaDetail /></ProtectedRoute>} />
          <Route path="/my-ideas" element={<ProtectedRoute allowedRoles={['WORKER', 'ANALYST', 'ADMIN']}><MyIdeas /></ProtectedRoute>} />
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/ideas" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminIdeasOverview /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSettings /></ProtectedRoute>} />
          {/* CRM Routes */}
          <Route path="/crm" element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}><CrmDashboard /></ProtectedRoute>} />
          <Route path="/crm/companies" element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}><CompaniesList /></ProtectedRoute>} />
          <Route path="/crm/contacts" element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}><ContactsList /></ProtectedRoute>} />
          <Route path="/crm/deals" element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}><DealsList /></ProtectedRoute>} />
          <Route path="/crm/activities" element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}><ActivitiesList /></ProtectedRoute>} />
          {/* Verticals Routes */}
          <Route path="/verticals" element={<ProtectedRoute allowedRoles={['ANALYST', 'ADMIN']}><VerticalsManagement /></ProtectedRoute>} />
          {/* Post-Mortem Routes */}
          <Route path="/post-mortems" element={<ProtectedRoute allowedRoles={['WORKER', 'ANALYST', 'ADMIN']}><PostMortemsList /></ProtectedRoute>} />
          <Route path="/post-mortems/:id" element={<ProtectedRoute allowedRoles={['WORKER', 'ANALYST', 'ADMIN']}><PostMortemDetail /></ProtectedRoute>} />
          {/* Projects Routes */}
          <Route path="/projects" element={<ProtectedRoute allowedRoles={['WORKER', 'ANALYST', 'ADMIN']}><ProjectsList /></ProtectedRoute>} />
          <Route path="/projects/new" element={<ProtectedRoute allowedRoles={['WORKER', 'ANALYST', 'ADMIN']}><NewProject /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute allowedRoles={['WORKER', 'ANALYST', 'ADMIN']}><ProjectDetail /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
