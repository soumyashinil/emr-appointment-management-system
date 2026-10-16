import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  const roleLabels = {
    super_admin: "Super Admin",
    receptionist: "Receptionist",
    doctor: "Doctor",
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800 text-xl font-bold text-white">
            E
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900">EMR Portal</h1>
            <p className="text-xs text-slate-500">Healthcare Management</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500">
              {roleLabels[user?.role] || user?.role}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Dashboard
          </Link>
          <Link
            to="/appointments/book"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Book Appointment
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
