import { Pencil, Trash2, ExternalLink, Monitor, Send, KeyRound } from "lucide-react";

const formatLastSeen = (value) => {
  if (!value) return "Never";

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function DeviceTable({ devices, onEdit, onDelete, onPush, onGenerateToken }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Device</th>
            <th>Location</th>
            <th>Status</th>
            <th>Last Seen</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {devices.map((device) => (
            <tr key={device.id} className="hover:bg-base-200/50">
              <td>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Monitor size={20} />
                  </div>

                  <div>
                    <p className="font-semibold">{device.name}</p>
                    <p className="font-mono text-xs text-base-content/50">
                      {device.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </td>

              <td>{device.location}</td>

              <td>
                <span
                  className={`badge badge-soft gap-2 ${
                    device.status === "online" ? "badge-success" : "badge-error"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      device.status === "online" ? "bg-success" : "bg-error"
                    }`}
                  />
                  {device.status === "online" ? "Online" : "Offline"}
                </span>
              </td>

              <td className="text-sm text-base-content/60">{formatLastSeen(device.last_seen)}</td>

              <td>
                <div className="flex justify-end gap-1">
                  <a
                    href={`/display/${device.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-square btn-sm"
                    title="Open device simulator"
                    aria-label={`Open ${device.name} simulator`}
                  >
                    <ExternalLink size={17} />
                  </a>

                  <button
                    type="button"
                    onClick={() => onPush(device)}
                    className="btn btn-ghost btn-square btn-sm"
                    title="Push content"
                    aria-label={`Push content to ${device.name}`}
                  >
                    <Send
                      size={17}
                      className={device.status !== "online" ? "text-gray-500" : "text-primary"}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(device)}
                    className="btn btn-ghost btn-square btn-sm"
                    title="Edit device"
                    aria-label={`Edit ${device.name}`}
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-square btn-sm"
                    onClick={() => onGenerateToken(device)}
                    title="Generate device token"
                    aria-label={`Generate token for ${device.name}`}
                  >
                    <KeyRound size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(device)}
                    className="btn btn-ghost btn-square btn-sm text-error"
                    title="Delete device"
                    aria-label={`Delete ${device.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
