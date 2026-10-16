import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/BookAppointment";
import StaffManagement from "./pages/StaffManagement";
import Patients from "./pages/Patients";

import PatientList from "./pages/PatientList";
// function ProtectedRoute() {
//   const { user, loading } = useAuth();

//   if (loading) return <p>Loading...</p>;

//   return user ? <Outlet /> : <Navigate to="/login" replace />;
// }
function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/book" element={<BookAppointment />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/list" element={<PatientList />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
        <Route path="/users" element={<StaffManagement />} />
      </Route>
      {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
    </Routes>
  );
}
