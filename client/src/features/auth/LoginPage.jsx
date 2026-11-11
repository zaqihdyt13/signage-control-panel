import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, MonitorPlay } from "lucide-react";

import { signIn } from "./auth.service";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { session, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from;
  const redirectTo =
    from?.pathname && from.pathname !== "/login"
      ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
      : "/";

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (session) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MonitorPlay size={30} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">Signage Control Panel</h1>

              <p className="mt-2 text-sm text-base-content/60">
                Sign in to manage your digital signage.
              </p>
            </div>
          </div>

          {error && (
            <div role="alert" className="alert alert-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label mb-2">
                Email Address
              </label>

              <label className="input flex w-full items-center gap-3">
                <Mail size={18} className="opacity-50" />

                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="grow"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
            </div>

            <div>
              <label htmlFor="password" className="label mb-2">
                Password
              </label>

              <label className="input flex w-full items-center gap-3">
                <LockKeyhole size={18} className="opacity-50" />

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="grow"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting && <span className="loading loading-spinner loading-sm" />}

              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-base-content/50">
            Authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
