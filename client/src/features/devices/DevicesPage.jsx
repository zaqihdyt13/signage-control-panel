import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Monitor, Plus, RefreshCw, Search } from "lucide-react";
import { deviceApi } from "./device.api";
import DeviceTable from "./components/DeviceTable";
import DeviceFormModal from "./components/DeviceFormModal";
import DeleteDeviceModal from "./components/DeleteDeviceModal";
import { useDeviceStatus } from "../../hooks/useDeviceStatus";
import PushContentModal from "./components/PushContentModal";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deletingDevice, setDeletingDevice] = useState(null);
  const [pushingDevice, setPushingDevice] = useState(null);
  const [generatedToken, setGeneratedToken] = useState(null);

  const latestStatusRef = useRef(new Map());

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await deviceApi.getAll();

      setDevices(
        data.map((device) => {
          const latestStatus = latestStatusRef.current.get(device.id);

          return latestStatus ? { ...device, ...latestStatus } : device;
        }),
      );
    } catch {
      setError("Failed to load devices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleDeviceStatus = useCallback((updatedDevice) => {
    latestStatusRef.current.set(updatedDevice.id, {
      status: updatedDevice.status,
      last_seen: updatedDevice.last_seen,
    });

    setDevices((previousDevices) =>
      previousDevices.map((device) =>
        device.id === updatedDevice.id
          ? {
              ...device,
              status: updatedDevice.status,
              last_seen: updatedDevice.last_seen,
            }
          : device,
      ),
    );
  }, []);

  useDeviceStatus(handleDeviceStatus, fetchDevices);

  const filteredDevices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return devices.filter((device) => {
      const matchesSearch =
        device.name.toLowerCase().includes(keyword) ||
        device.location.toLowerCase().includes(keyword);

      const matchesStatus = statusFilter === "all" || device.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [devices, search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingDevice(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (device) => {
    setEditingDevice(device);
    setFormOpen(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    setNotice("");

    try {
      if (editingDevice) {
        await deviceApi.update(editingDevice.id, payload);
        setNotice("Device updated successfully.");
      } else {
        await deviceApi.create(payload);
        setNotice("Device created successfully.");
      }

      setFormOpen(false);
      setEditingDevice(null);
      await fetchDevices();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDevice) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await deviceApi.delete(deletingDevice.id);
      setDeletingDevice(null);
      setNotice("Device deleted successfully.");
      await fetchDevices();
    } catch {
      setError("Failed to delete device.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateToken = async (device) => {
    const confirmed = window.confirm(
      `Generate a new token for "${device.name}"?\n\n` + "This will invalidate its previous token.",
    );

    if (!confirmed) return;

    try {
      const result = await deviceApi.generateToken(device.id);

      setGeneratedToken({
        deviceName: device.name,
        token: result.token,
      });
    } catch (error) {
      console.error("Failed to generate device token:", error);
      setNotice("Failed to generate device token.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Devices</h1>
          <p className="mt-1 text-base-content/60">Manage and monitor your signage devices.</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          Add Device
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
              <h2 className="card-title">Device List</h2>
              <p className="text-sm text-base-content/60">{devices.length} registered devices</p>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={fetchDevices}
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
                placeholder="Search devices..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <select
              className="select w-full sm:w-44"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center py-16">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="rounded-full bg-base-200 p-5">
                  <Monitor size={32} className="text-base-content/40" />
                </div>

                <h3 className="mt-4 font-semibold">No devices found</h3>
                <p className="mt-1 text-sm text-base-content/60">
                  {devices.length === 0
                    ? "Add your first device to get started."
                    : "Try changing your search or filter."}
                </p>
              </div>
            ) : (
              <DeviceTable
                devices={filteredDevices}
                onEdit={handleOpenEdit}
                onDelete={setDeletingDevice}
                onPush={setPushingDevice}
                onGenerateToken={handleGenerateToken}
              />
            )}
          </div>
        </div>
      </div>

      <DeviceFormModal
        open={formOpen}
        device={editingDevice}
        loading={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
      />

      <DeleteDeviceModal
        device={deletingDevice}
        loading={saving}
        onClose={() => setDeletingDevice(null)}
        onConfirm={handleDelete}
      />

      {pushingDevice && (
        <PushContentModal
          device={pushingDevice}
          onClose={() => setPushingDevice(null)}
          onSuccess={(result) => {
            setPushingDevice(null);

            setNotice(
              result.delivered
                ? "Content saved and delivered to the device."
                : "Content saved. The device will sync when connected.",
            );
          }}
        />
      )}

      {generatedToken && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="text-lg font-bold">Device Token Generated</h3>

            <p className="mt-2 text-sm text-base-content/70">Device: {generatedToken.deviceName}</p>

            <div className="alert alert-warning mt-4 text-sm">
              Copy this token now. It will not be shown again.
            </div>

            <div className="mt-4 rounded-lg bg-base-200 p-3">
              <code className="break-all text-sm">{generatedToken.token}</code>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(generatedToken.token);
                    setNotice("Token copied to clipboard.");
                  } catch {
                    setNotice("Unable to copy token.");
                  }
                }}
              >
                Copy Token
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setGeneratedToken(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
