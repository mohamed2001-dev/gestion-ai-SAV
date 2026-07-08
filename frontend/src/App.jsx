import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            <Route
                path="/login"
                element={
                    <GuestRoute>
                    <Login />
                    </GuestRoute>
                }
                />

            <Route
            path="/admin/dashboard"
            element={
                <ProtectedRoute role="admin">
                <AdminDashboard />
                </ProtectedRoute>
            }
            />

            <Route
                path="/technician/dashboard"
                element={
                <ProtectedRoute role="technician">
                <TechnicianDashboard />
                </ProtectedRoute>
                }
                />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
