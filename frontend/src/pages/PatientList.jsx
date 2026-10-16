import { useState } from "react";
import api from "../services/api";
import Header from "../components/Header";

export default function PatientList() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    setSearched(true);

    try {
      const response = await api.get("/patients", {
        params: { search: search.trim() },
      });

      setPatients(response.data.data.patients || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to search patients."
      );
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Patient Records
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Search patients by name, mobile number, or patient ID.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-6 flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm sm:flex-row"
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Enter patient name, mobile, or patient ID"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 p-3"
          />

          <button
            type="submit"
            disabled={loading || !search.trim()}
            className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {searched && !loading && !error && (
          <section className="mt-6 overflow-x-auto rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900">
              Search Results ({patients.length})
            </h2>

            {patients.length === 0 ? (
              <p className="text-sm text-slate-500">
                No matching patients found.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3">Patient ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient._id} className="border-t">
                      <td className="p-3">{patient.patientId}</td>
                      <td className="p-3">{patient.name}</td>
                      <td className="p-3">{patient.mobile}</td>
                      <td className="p-3">{patient.gender || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
    </div>
  );
}