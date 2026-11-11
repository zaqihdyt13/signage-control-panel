import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import { contentApi } from "../../contents/content.api";
import { deviceApi } from "../device.api";

export default function PushContentModal({ device, onClose, onSuccess }) {
  const [contents, setContents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    contentApi
      .getAll()
      .then((data) => {
        if (active) setContents(data);
      })
      .catch(() => {
        if (active) setError("Failed to load contents.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedId || sending) return;

    setSending(true);
    setError("");

    try {
      const result = await deviceApi.pushContent(device.id, selectedId);

      onSuccess(result);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to push content.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Push Content</h3>
            <p className="mt-1 text-sm text-base-content/60">Target: {device.name}</p>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm"
            onClick={onClose}
            disabled={sending}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="push-content" className="label mb-2">
              Select Content
            </label>

            <select
              id="push-content"
              className="select w-full"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              disabled={loading || sending}
              required
            >
              <option value="">Choose content...</option>

              {contents.map((content) => (
                <option key={content.id} value={content.id}>
                  {content.title} ({content.type})
                </option>
              ))}
            </select>
          </div>

          {loading && <span className="loading loading-spinner loading-sm" />}

          {!loading && contents.length === 0 && !error && (
            <p className="text-sm text-base-content/60">No content available. Add content first.</p>
          )}

          {error && (
            <div role="alert" className="alert alert-error text-sm">
              {error}
            </div>
          )}

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={sending}>
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedId || loading || sending}
            >
              {sending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Send size={17} />
              )}
              Push Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
