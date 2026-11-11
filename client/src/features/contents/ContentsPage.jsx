import { useCallback, useEffect, useMemo, useState } from "react";
import { Images, Plus, RefreshCw, Search } from "lucide-react";

import { contentApi } from "./content.api";
import ContentCard from "./components/ContentCard";
import ContentFormModal from "./components/ContentFormModal";
import DeleteContentModal from "./components/DeleteContentModal";

export default function ContentsPage() {
  const [contents, setContents] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [deletingContent, setDeletingContent] = useState(null);

  const fetchContents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await contentApi.getAll();
      setContents(data);
    } catch {
      setError("Failed to load contents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const filteredContents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return contents.filter((content) => {
      const matchesSearch = content.title.toLowerCase().includes(keyword);

      const matchesType = typeFilter === "all" || content.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [contents, search, typeFilter]);

  const handleOpenCreate = () => {
    setEditingContent(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (content) => {
    setEditingContent(content);
    setFormOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    setNotice("");

    try {
      if (editingContent) {
        await contentApi.update(editingContent.id, {
          title: payload.title,
          type: payload.type,
          payload: payload.payload,
        });

        setNotice("Content updated successfully.");
      } else if (payload.mode === "upload") {
        await contentApi.upload({
          title: payload.title,
          file: payload.file,
        });

        setNotice("Content uploaded successfully.");
      } else {
        await contentApi.create({
          title: payload.title,
          type: payload.type,
          payload: payload.payload,
        });

        setNotice("Content created successfully.");
      }

      setFormOpen(false);
      setEditingContent(null);
      await fetchContents();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingContent) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await contentApi.delete(deletingContent.id);
      setDeletingContent(null);
      setNotice("Content deleted successfully.");
      await fetchContents();
    } catch {
      setError("Failed to delete content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contents</h1>
          <p className="mt-1 text-base-content/60">Manage your digital signage content library.</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          Add Content
        </button>
      </div>

      {notice && (
        <div role="status" className="alert alert-success">
          <span>{notice}</span>
          <button type="button" className="btn btn-ghost btn-xs" onClick={() => setNotice("")}>
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="card-title">Content Library</h2>
              <p className="text-sm text-base-content/60">{contents.length} contents available</p>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={fetchContents}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="input flex w-full items-center gap-2 sm:max-w-sm">
              <Search size={18} className="opacity-50" />
              <input
                type="search"
                className="grow"
                placeholder="Search contents..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <select
              className="select w-full sm:w-44"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="url">Websites</option>
            </select>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-xl border border-base-300">
                    <div className="skeleton aspect-video w-full rounded-none" />
                    <div className="space-y-3 p-4">
                      <div className="skeleton h-5 w-3/4" />
                      <div className="skeleton h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredContents.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="rounded-full bg-base-200 p-5">
                  <Images size={32} className="text-base-content/40" />
                </div>

                <h3 className="mt-4 font-semibold">No contents found</h3>

                <p className="mt-1 text-sm text-base-content/60">
                  {contents.length === 0
                    ? "Add your first content to get started."
                    : "Try changing your search or filter."}
                </p>

                {contents.length === 0 && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm mt-5"
                    onClick={handleOpenCreate}
                  >
                    <Plus size={16} />
                    Add Content
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredContents.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onEdit={handleOpenEdit}
                    onDelete={setDeletingContent}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ContentFormModal
        open={formOpen}
        content={editingContent}
        loading={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
      />

      <DeleteContentModal
        content={deletingContent}
        loading={saving}
        onClose={() => setDeletingContent(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
