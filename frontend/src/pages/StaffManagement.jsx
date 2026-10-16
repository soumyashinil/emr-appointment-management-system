import { useEffect, useState } from "react";
import api from "../services/api";
import Header from "../components/Header";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
    department: "",
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setStaff(response.data.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      await api.post("/users", form);
      setMessage("Staff member created successfully!");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "doctor",
        department: "",
      });

      await fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create staff member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create and view doctor and receptionist accounts.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold">Create Staff Member</h2>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Temporary password"
            required
            minLength={8}
            className="w-full rounded-lg border p-3"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          >
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
          </select>

          {form.role === "doctor" && (
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department (e.g. Cardiology)"
              required
              className="w-full rounded-lg border p-3"
            />
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Staff"}
          </button>
        </form>

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Staff Members</h2>

          {loading ? (
            <p className="mt-4 text-slate-500">Loading staff...</p>
          ) : staff.length === 0 ? (
            <p className="mt-4 text-slate-500">No staff members found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member._id} className="border-t">
                      <td className="p-3">{member.name}</td>
                      <td className="p-3">{member.email}</td>
                      <td className="p-3">{member.role}</td>
                      <td className="p-3">{member.department || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
