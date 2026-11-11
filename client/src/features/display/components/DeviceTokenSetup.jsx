import { useState } from "react";
import { KeyRound, MonitorPlay } from "lucide-react";

export default function DeviceTokenSetup({ deviceId, onSubmit }) {
  const [token, setToken] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!token.trim()) return;

    onSubmit(token.trim());
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body gap-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-2xl bg-primary/10 p-4 text-primary">
              <MonitorPlay size={30} />
            </div>

            <div>
              <h1 className="text-xl font-bold">Device Setup</h1>

              <p className="mt-2 text-sm text-base-content/60">
                Enter the token provided by your administrator.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-base-200 p-3">
            <p className="text-xs text-base-content/60">Device ID</p>

            <p className="mt-1 break-all font-mono text-xs">{deviceId}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="device-token" className="label mb-2">
                Device Token
              </label>

              <label className="input flex w-full items-center gap-3">
                <KeyRound size={18} className="opacity-50" />

                <input
                  id="device-token"
                  type="password"
                  placeholder="Enter device token"
                  className="grow"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  autoComplete="off"
                  required
                />
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={!token.trim()}>
              Connect Device
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
