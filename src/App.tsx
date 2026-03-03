import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AdminDashboard from "./pages/AdminDashboard";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Navigate to="/dashboard" replace />
          </Layout>
        </PrivateRoute>
      } />

      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />

      <Route path="/upload" element={
        <PrivateRoute>
          <Layout>
            <Upload />
          </Layout>
        </PrivateRoute>
      } />

      <Route path="/admin" element={
        <PrivateRoute>
          <Layout>
            <AdminDashboard />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
