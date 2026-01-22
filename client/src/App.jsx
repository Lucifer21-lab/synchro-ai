import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import MyTasks from './pages/MyTasks';
import Kanban from './pages/Kanban';
import NotFound from './pages/NotFound'; // <--- Import this
import Layout from './components/Layout';
import ForgotPassword from './pages/ForgotPassword'; // Import
import ResetPassword from './pages/ResetPassword';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4 text-white">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-300">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
        </Route>

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Catch-all Route for 404 - MUST BE LAST */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;