import { AlertTriangle } from "lucide-react";

export default function DeleteContentModal({ content, loading, onClose, onConfirm }) {
  if (!content) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-error/10 p-4 text-error">
            <AlertTriangle size={30} />
          </div>

          <h3 className="text-xl font-bold">Delete Content?</h3>

          <p className="mt-3 text-base-content/60">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-base-content">{content.title}</span>? This action
            cannot be undone.
          </p>
        </div>

        <div className="modal-action mt-8">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>

          <button type="button" className="btn btn-error" onClick={onConfirm} disabled={loading}>
            {loading && <span className="loading loading-spinner loading-sm" />}
            Delete Content
          </button>
        </div>
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
