import { useEffect } from "react";
import api from "../services/api";
import { useState } from "react";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "—";

  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusStyle(status) {
  return (
    {
      scheduled: "bg-blue-50 text-blue-700",
      arrived: "bg-amber-50 text-amber-700",
      completed: "bg-emerald-50 text-emerald-700",
      cancelled: "bg-red-50 text-red-700",
    }[status] || "bg-slate-100 text-slate-700"
  );
}
export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  const { user } = useAuth();
  const [notes, setNotes] = useState({});
  const [actionLoading, setActionLoading] = useState("");

  const [search, setSearch] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await api.get("/appointments");
      setAppointments(response.data.data.appointments);
    } catch (err) {
      setError("Unable to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, reloadCount]);

  const filteredAppointments = appointments.filter((appointment) => {
    const searchText = search.trim().toLowerCase();

    return (
      appointment.patient?.name?.toLowerCase().includes(searchText) ||
      appointment.patient?.patientId?.toLowerCase().includes(searchText) ||
      appointment.patient?.mobile?.includes(searchText) ||
      appointment.doctor?.name?.toLowerCase().includes(searchText)
    );
  });
  if (loading) return <p>Loading appointments...</p>;
  {
    console.log(appointments);
  }
  if (error) return <p className="error-message">{error}</p>;

  const handleAction = async (appointmentId, updates) => {
    setActionLoading(appointmentId);
    setError("");

    try {
      await api.put(`/appointments/${appointmentId}`, updates);
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update appointment");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navigation */}
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">
              APPOINTMENT MANAGEMENT
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Appointments
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              View and track scheduled patient visits.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReloadCount((count) => count + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </section>

        {/* Summary */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total appointments loaded
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {appointments.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Scheduled</p>

            <p className="mt-2 text-3xl font-bold text-blue-800">
              {
                appointments.filter(
                  (appointment) => appointment.status === "scheduled",
                ).length
              }
            </p>
          </div>
        </section>
        <div className="mt-8">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by patient name, patient ID, mobile, or doctor..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {/* Appointment table */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h3 className="text-lg font-bold text-slate-900">
              Appointment list
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Appointment details returned by the server.
            </p>
          </div>

          {loading ? (
            <div
              className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-600"
              role="status"
            >
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-800 border-t-transparent" />
              Loading appointments...
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => setReloadCount((count) => count + 1)}
                className="mt-4 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
              >
                Try again
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl" aria-hidden="true">
                📅
              </div>

              <h4 className="mt-4 font-semibold text-slate-900">
                No appointments found
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Appointments will appear here when they are available.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Patient",
                      "Doctor",
                      "Department",
                      "Date",
                      "Time",
                      "Status",

                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {appointment.patient?.name || "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          ID: {appointment.patient?.patientId || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Mobile: {appointment.patient?.mobile || "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                        {appointment.doctor?.name || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                        {appointment.department || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                        {formatDate(appointment.appointmentDate)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                        {formatTime(appointment.startTime)}
                        {" – "}
                        {formatTime(appointment.endTime)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusStyle(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status || "unknown"}
                        </span>
                      </td>

                      <td className="space-y-2 px-5 py-4">
                        {user?.role === "receptionist" &&
                          appointment.status === "scheduled" && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading === appointment._id}
                                onClick={() =>
                                  handleAction(appointment._id, {
                                    status: "arrived",
                                  })
                                }
                                className="block rounded bg-amber-100 px-3 py-2 text-sm text-amber-800 disabled:opacity-50"
                              >
                                Mark arrived
                              </button>

                              <button
                                type="button"
                                disabled={actionLoading === appointment._id}
                                onClick={() =>
                                  handleAction(appointment._id, {
                                    status: "cancelled",
                                  })
                                }
                                className="block rounded bg-red-100 px-3 py-2 text-sm text-red-700 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                        {user?.role === "super_admin" &&
                          !["completed", "cancelled"].includes(
                            appointment.status,
                          ) && (
                            <>
                              {appointment.status === "scheduled" && (
                                <button
                                  type="button"
                                  disabled={actionLoading === appointment._id}
                                  onClick={() =>
                                    handleAction(appointment._id, {
                                      status: "arrived",
                                    })
                                  }
                                  className="block rounded bg-amber-100 px-3 py-2 text-sm text-amber-800 disabled:opacity-50"
                                >
                                  Mark arrived
                                </button>
                              )}

                              <button
                                type="button"
                                disabled={actionLoading === appointment._id}
                                onClick={() =>
                                  handleAction(appointment._id, {
                                    status: "cancelled",
                                  })
                                }
                                className="block rounded bg-red-100 px-3 py-2 text-sm text-red-700 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                        {user?.role === "doctor" &&
                          appointment.status === "arrived" && (
                            <>
                              <textarea
                                value={
                                  notes[appointment._id] ??
                                  appointment.consultationNotes ??
                                  ""
                                }
                                onChange={(event) =>
                                  setNotes((previous) => ({
                                    ...previous,
                                    [appointment._id]: event.target.value,
                                  }))
                                }
                                placeholder="Consultation notes"
                                className="w-32 max-w-full rounded border border-slate-300 p-2 text-sm"
                                rows={3}
                              />

                              <button
                                type="button"
                                disabled={actionLoading === appointment._id}
                                onClick={() =>
                                  handleAction(appointment._id, {
                                    consultationNotes:
                                      notes[appointment._id] ??
                                      appointment.consultationNotes ??
                                      "",
                                  })
                                }
                                className="block rounded bg-blue-100 px-3 py-2 text-sm text-blue-800 disabled:opacity-50"
                              >
                                Save notes
                              </button>

                              <button
                                type="button"
                                disabled={actionLoading === appointment._id}
                                onClick={() =>
                                  handleAction(appointment._id, {
                                    status: "completed",
                                    consultationNotes:
                                      notes[appointment._id] ??
                                      appointment.consultationNotes ??
                                      "",
                                  })
                                }
                                className="block rounded bg-emerald-100 px-3 py-2 text-sm text-emerald-800 disabled:opacity-50"
                              >
                                Complete
                              </button>
                            </>
                          )}
                        {user?.role === "doctor" &&
                          appointment.status === "completed" && (
                            <p className="max-w-40 whitespace-normal break-words text-sm text-slate-700">
                              {appointment.consultationNotes ||
                                "No consultation notes"}
                            </p>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && appointments.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500 sm:px-6">
              Showing {filteredAppointments.length} appointment
              {filteredAppointments.length !== 1 ? "s" : ""} returned by the
              API.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
