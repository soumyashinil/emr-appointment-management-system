import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        {/* Left panel - desktop and tablet */}
        <div className="hidden flex-col justify-between bg-blue-800 p-10 text-white md:flex lg:p-12">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-xl font-bold">
                E
              </div>
              <div>
                <h1 className="text-xl font-bold">EMR Portal</h1>
                <p className="text-sm text-blue-200">Healthcare Management</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold leading-tight lg:text-4xl">
              Better care starts with better coordination.
            </h2>

            <p className="mt-5 leading-7 text-blue-100">
              Manage appointments, coordinate care teams, and keep patient
              information organized in one secure workspace.
            </p>
          </div>

          <p className="mt-12 text-sm text-blue-200">
            Secure access for authorized healthcare staff.
          </p>
        </div>

        {/* Login form */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 md:hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-800 text-xl font-bold text-white">
                E
              </div>
              <h1 className="text-2xl font-bold text-slate-900">EMR Portal</h1>
              <p className="mt-1 text-sm text-slate-500">
                Healthcare Management
              </p>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@hospital.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center rounded-lg bg-blue-800 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-slate-500">
              Authorized personnel only. Access is monitored for security.
            </p>
          </div>
        </div>
      </div>
    </div>
    /* <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
        
     </div>
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>EMR Portal</h1>
        <p>Sign in to manage appointments</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>*/
  );
}
