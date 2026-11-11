import { Image as ImageIcon, Video, Globe, Pencil, Trash2, ExternalLink } from "lucide-react";

const typeConfig = {
  image: {
    label: "Image",
    icon: ImageIcon,
    badge: "badge-info",
  },
  video: {
    label: "Video",
    icon: Video,
    badge: "badge-secondary",
  },
  url: {
    label: "Website",
    icon: Globe,
    badge: "badge-accent",
  },
};

export default function ContentCard({ content, onEdit, onDelete }) {
  const config = typeConfig[content.type] || typeConfig.url;
  const Icon = config.icon;

  return (
    <div className="card overflow-hidden border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-base-200">
        {content.type === "image" ? (
          <img
            src={content.payload}
            alt={content.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : content.type === "video" ? (
          <video
            src={content.payload}
            className="h-full w-full object-cover"
            preload="metadata"
            muted
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-base-content/40">
            <Globe size={48} />
            <span className="text-sm">Website Content</span>
          </div>
        )}

        <span className={`badge badge-soft absolute left-3 top-3 ${config.badge}`}>
          <Icon size={13} />
          {config.label}
        </span>
      </div>

      <div className="card-body gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold" title={content.title}>
            {content.title}
          </h3>

          <p className="mt-1 text-xs text-base-content/50">
            {new Date(content.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-base-300 pt-3">
          <a
            href={content.payload}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
          >
            <ExternalLink size={16} />
            Preview
          </a>

          <div className="flex gap-1">
            <button
              type="button"
              className="btn btn-ghost btn-square btn-sm"
              onClick={() => onEdit(content)}
              title="Edit content"
              aria-label={`Edit ${content.title}`}
            >
              <Pencil size={17} />
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-square btn-sm text-error"
              onClick={() => onDelete(content)}
              title="Delete content"
              aria-label={`Delete ${content.title}`}
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
