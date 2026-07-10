import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard"
import TechnicianDashboard from "./pages/technician/TechnicianDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import GuestRoute from "./components/GuestRoute";
import AdminLayout from "./layouts/AdminLayout";
import TechnicianLayout from "./layouts/TechnicianLayout";
import Clients from "./pages/admin/Clients";
import Equipments from "./pages/admin/Equipments";
import Interventions from "./pages/admin/Interventions";
import SavRequests from "./pages/admin/SavRequests";
import Technicians from "./pages/admin/Technicians";

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
                path="/admin"
                element={
            <ProtectedRoute role="admin">
                <AdminLayout />
            </ProtectedRoute>
            }
            >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="clients" element={<Clients/>} />
                <Route path="equipments" element={<Equipments/>} />
                <Route path="interventions" element={<Interventions/>} />
                <Route path="sav-requests" element={<SavRequests/>} />
                <Route path="technicians" element={<Technicians/>} />
            </Route>

            <Route
                path="/technician"
                element={
                <ProtectedRoute role="technician">
                <TechnicianLayout />
                </ProtectedRoute>
                }
                >
                <Route path="dashboard" element={<TechnicianDashboard/>}/>
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
