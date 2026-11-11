import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function DeviceFormModal({ open, device, loading, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    location: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: device?.name ?? "",
        location: device?.location ?? "",
      });
      setError("");
    }
  }, [open, device]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const location = form.location.trim();

    if (!name || !location) {
      setError("All fields are required.");
      return;
    }

    if (name.length > 100 || location.length > 255) {
      setError("Input exceeds the allowed length.");
      return;
    }

    setError("");

    try {
      await onSubmit({ name, location });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save device.");
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">{device ? "Edit Device" : "Add Device"}</h3>

          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="device-name" className="label mb-2">
              Device Name
            </label>
            <input
              id="device-name"
              className="input w-full"
              placeholder="e.g. Lobby Display"
              value={form.name}
              maxLength={100}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="device-location" className="label mb-2">
              Location
            </label>
            <input
              id="device-location"
              className="input w-full"
              placeholder="e.g. Main Building - 1st Floor"
              value={form.location}
              maxLength={255}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div role="alert" className="alert alert-error text-sm">
              {error}
            </div>
          )}

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="loading loading-spinner loading-sm" />}
              {device ? "Save Changes" : "Add Device"}
            </button>
          </div>
        </form>
      </div>

      <button
        type="button"
        className="modal-backdrop"
        onClick={onClose}
        disabled={loading}
        aria-label="Close modal"
      >
        Close
      </button>
    </div>
  );
}
