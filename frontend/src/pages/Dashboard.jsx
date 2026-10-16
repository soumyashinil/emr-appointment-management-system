import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Header from "../components/Header";
export default function Dashboard() {
  const { user, logout } = useAuth();

  const roleLabels = {
    super_admin: "Super Admin",
    receptionist: "Receptionist",
    doctor: "Doctor",
  };

  const menuItems = {
    super_admin: [
      {
        title: "Appointments",
        description: "View and manage all appointments.",
        icon: "📅",
        link: "/appointments",
        buttonText: "View appointments",
      },
      {
        title: "Doctors & Receptionists",
        description: "Manage staff accounts and roles.",
        icon: "🩺",
        link: "/users",
        buttonText: "Manage staff",
      },
    ],

    receptionist: [
      {
        title: "Appointments",
        description: "Book, update, and manage patient appointments.",
        icon: "📅",
        link: "/appointments",
        buttonText: "View appointments",
      },
      {
        title: "Patients",
        description: "Register patients and search patient records.",
        icon: "👥",
        link: "/patients",
        buttonText: "Manage patients",
      },
      {
        title: "Book Appointment",
        description: "Find available doctors and appointment slots.",
        icon: "➕",
        link: "/appointments/book",
        buttonText: "Book appointment",
      },
      {
        title: "Patient Records",
        description: "Search existing patient records.",
        icon: "👥",
        link: "/patients/list",
        buttonText: "Search patients",
      },
    ],

    doctor: [
      {
        title: "My Appointments",
        description: "View your appointments and patient information.",
        icon: "📅",
        link: "/appointments",
        buttonText: "View appointments",
      },
      {
        title: "Patient Records",
        description: "Review patient details and consultation notes.",
        icon: "👥",
        link: "/appointments",
        buttonText: "View patients",
      },
    ],
  };

  const userMenuItems = menuItems[user?.role] || [];
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top navigation */}
      <Header />

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <section className="rounded-2xl bg-blue-800 px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
          <p className="text-sm font-medium text-blue-200">
            HEALTHCARE MANAGEMENT SYSTEM
          </p>

          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Welcome back, {user?.name || "User"}!
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
            Manage appointments and coordinate patient care from one centralized
            workspace.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/appointments"
              className="inline-flex items-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              View appointments
            </Link>

            <Link
              to="/appointments/book"
              className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Book appointment
            </Link>
          </div>
        </section>

        {/* User information */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Your workspace</h2>
            <p className="mt-1 text-sm text-slate-500">
              Access the features available to your account.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {userMenuItems.map((item) => (
              <div
                key={item.title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  {item.icon}
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

                <Link
                  to={item.link}
                  className="mt-5 w-fit rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500"
                >
                  {item.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Account details */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Account information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <p className="mt-1 font-medium text-slate-900">
                {user?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Role</p>
              <p className="mt-1 font-medium text-slate-900">
                {roleLabels[user?.role] || user?.role || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-1 break-all font-medium text-slate-900">
                {user?.email || "—"}
              </p>
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">
          EMR Portal · Secure healthcare management
        </footer>
      </main>
    </div>
  );
}
