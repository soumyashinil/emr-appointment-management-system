import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [refreshSlots, setRefreshSlots] = useState(0);

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/users/doctors");
        setDoctors(response.data.data.doctors || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load doctors");
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!doctorId || !appointmentDate) {
      setSlots([]);
      setStartTime("");
      return;
    }

    let cancelled = false;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlots([]);
      setStartTime("");
      setError("");

      try {
        const response = await api.get("/slots", {
          params: {
            doctorId,
            date: appointmentDate,
          },
        });

        if (!cancelled) {
          setSlots(response.data.data.slots || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Failed to load available slots",
          );
        }
      } finally {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      }
    };

    fetchSlots();

    return () => {
      cancelled = true;
    };
  }, [doctorId, appointmentDate, refreshSlots]);

  useEffect(() => {
    if (search.trim().length < 2) {
      setPatients([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);

      try {
        const response = await api.get("/patients", {
          params: { search: search.trim() },
        });

        setPatients(response.data.data.patients || []);
      } catch (err) {
        setError(err.response?.data?.message || "Patient search failed");
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleBooking = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!selectedPatient) {
      setError("Please search and select a patient");
      return;
    }

    if (!doctorId || !appointmentDate || !startTime) {
      setError("Please complete all appointment details");
      return;
    }

    setLoading(true);

    try {
      await api.post("/appointments", {
        patientId: selectedPatient._id,
        doctorId,
        appointmentDate,
        startTime,
      });

      setMessage("Appointment booked successfully!");

      setSelectedPatient(null);
      setSearch("");
      setPatients([]);
      setStartTime("");
      setRefreshSlots((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-[calc(100vh-80px)] bg-slate-50 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/appointments"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Back to appointments
          </Link>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold text-slate-800">
              Book an Appointment
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Select a patient, doctor, date and appointment time.
            </p>

            {message && (
              <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {message}
                <div className="mt-2">
                  <Link to="/appointments" className="font-semibold underline">
                    View appointments
                  </Link>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleBooking} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Search Patient
                </label>

                {selectedPatient ? (
                  <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {selectedPatient.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedPatient.patientId} · {selectedPatient.mobile}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(null);
                        setSearch("");
                        setPatients([]);
                      }}
                      className="text-sm font-medium text-blue-600"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setError("");
                      }}
                      placeholder="Search by name, mobile or patient ID"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    {searching && (
                      <p className="mt-2 text-sm text-slate-500">
                        Searching patients...
                      </p>
                    )}

                    {patients.length > 0 && (
                      <div className="mt-2 divide-y rounded-lg border border-slate-200">
                        {patients.map((patient) => (
                          <button
                            key={patient._id}
                            type="button"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setSearch("");
                              setPatients([]);
                              setError("");
                            }}
                            className="w-full p-3 text-left hover:bg-slate-50"
                          >
                            <span className="block font-medium text-slate-800">
                              {patient.name}
                            </span>
                            <span className="text-sm text-slate-500">
                              {patient.patientId} · {patient.mobile}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {search.trim().length >= 2 &&
                      !searching &&
                      patients.length === 0 && (
                        <p className="mt-2 text-sm text-slate-500">
                          No matching patients found.
                        </p>
                      )}
                  </>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Doctor
                </label>

                <select
                  value={doctorId}
                  onChange={(event) => setDoctorId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name}
                      {doctor.department ? ` — ${doctor.department}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    value={appointmentDate}
                    onChange={(event) => setAppointmentDate(event.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Available Time Slots
                  </label>

                  {!doctorId || !appointmentDate ? (
                    <p className="text-sm text-slate-500">
                      Select a doctor and date first.
                    </p>
                  ) : slotsLoading ? (
                    <p className="text-sm text-slate-500">
                      Loading available slots...
                    </p>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-amber-700">
                      No available slots for this date.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => setStartTime(slot.startTime)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                            startTime === slot.startTime
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-blue-500"
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500">
                The selected time must match the doctor's working schedule and
                an available slot. Server-side availability validation must be
                enforced before confirming the booking.
              </p>

              <button
                type="submit"
                disabled={loading || slotsLoading || !startTime}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Booking..." : "Book Appointment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default BookAppointment;
