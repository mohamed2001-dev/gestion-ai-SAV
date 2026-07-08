import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user.role === "admin") {
    return <Navigate to="/admin/dashboard" />;
    }

    if (token && user.role === "technician") {
    return <Navigate to="/technician/dashboard" />;
    }

    return children;
}
