import { useEffect, useState } from "react";
import { Upload, Link as LinkIcon, X } from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];

export default function ContentFormModal({ open, content, loading, onClose, onSubmit }) {
  const [mode, setMode] = useState("upload");
  const [form, setForm] = useState({
    title: "",
    type: "url",
    payload: "",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setMode(content ? "url" : "upload");
    setForm({
      title: content?.title ?? "",
      type: content?.type ?? "url",
      payload: content?.payload ?? "",
    });
    setFile(null);
    setError("");
  }, [open, content]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = form.title.trim();

    if (!title) {
      setError("Title is required.");
      return;
    }

    if (title.length > 150) {
      setError("Title must not exceed 150 characters.");
      return;
    }

    try {
      setError("");

      if (!content && mode === "upload") {
        if (!file) {
          setError("Please select a file.");
          return;
        }

        if (!allowedTypes.includes(file.type)) {
          setError("Unsupported file type.");
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          setError("File must not exceed 50 MB.");
          return;
        }

        await onSubmit({
          mode: "upload",
          title,
          file,
        });

        return;
      }

      const url = new URL(form.payload);

      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid URL protocol");
      }

      await onSubmit({
        mode: "url",
        title,
        type: form.type,
        payload: form.payload.trim(),
      });
    } catch (err) {
      if (err instanceof TypeError || err.message === "Invalid URL protocol") {
        setError("Please enter a valid HTTP or HTTPS URL.");
      } else {
        setError(err.response?.data?.message || "Failed to save content.");
      }
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">{content ? "Edit Content" : "Add Content"}</h3>

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

        {!content && (
          <div role="tablist" className="tabs tabs-box mb-5">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "upload"}
              className={`tab gap-2 ${mode === "upload" ? "tab-active" : ""}`}
              onClick={() => setMode("upload")}
            >
              <Upload size={16} />
              Upload File
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === "url"}
              className={`tab gap-2 ${mode === "url" ? "tab-active" : ""}`}
              onClick={() => setMode("url")}
            >
              <LinkIcon size={16} />
              Attach URL
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="content-title" className="label mb-2">
              Content Title
            </label>
            <input
              id="content-title"
              className="input w-full"
              placeholder="e.g. Welcome Banner"
              value={form.title}
              maxLength={150}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              disabled={loading}
              required
            />
          </div>

          {!content && mode === "upload" ? (
            <div>
              <label htmlFor="content-file" className="label mb-2">
                Image or Video
              </label>
              <input
                id="content-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                className="file-input w-full"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                disabled={loading}
                required
              />
              <p className="mt-2 text-xs text-base-content/60">
                JPG, PNG, WebP, MP4, WebM. Maximum 50 MB.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="content-type" className="label mb-2">
                  Content Type
                </label>
                <select
                  id="content-type"
                  className="select w-full"
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                  disabled={loading}
                >
                  <option value="url">Website URL</option>
                  <option value="image">Image URL</option>
                  <option value="video">Video URL</option>
                </select>
              </div>

              <div>
                <label htmlFor="content-url" className="label mb-2">
                  Content URL
                </label>
                <input
                  id="content-url"
                  type="url"
                  className="input w-full"
                  placeholder="https://example.com/content"
                  value={form.payload}
                  onChange={(event) => setForm({ ...form, payload: event.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </>
          )}

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
              {content ? "Save Changes" : "Add Content"}
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
