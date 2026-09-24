import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project/:id" 
          element={
            <ProtectedRoute>
              <ProjectBoard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
