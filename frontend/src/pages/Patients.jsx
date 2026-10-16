import { useState } from "react";
import api from "../services/api";
import Header from "../components/Header";

export default function Patients() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    dateOfBirth: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      const response = await api.post("/patients", form);
      const patient = response.data.data.patient;

      setSuccess(patient);
      setForm({
        name: "",
        mobile: "",
        dateOfBirth: "",
        gender: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register patient.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Patient Registration
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Register a new patient and create their patient record.
        </p>

        {success && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-800">
              Patient registered successfully!
            </p>
            <p className="mt-2 text-sm text-green-700">
              Patient ID: {success.patientId}
            </p>
            <p className="text-sm text-green-700">Name: {success.name}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Patient Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mobile Number
            </label>
            <input
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              required
              placeholder="Enter mobile number"
              maxLength={10}
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Date of Birth
            </label>
            <input
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 p-3"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register Patient"}
          </button>
        </form>
      </main>
    </div>
  );
}
