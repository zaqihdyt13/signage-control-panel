import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Monitor, Wifi, WifiOff, Images } from "lucide-react";

import { api } from "../../lib/api";
import { useDeviceStatus } from "../../hooks/useDeviceStatus";

const statItems = [
  {
    key: "totalDevices",
    label: "Total Devices",
    icon: Monitor,
    color: "text-primary",
    background: "bg-primary/10",
  },
  {
    key: "onlineDevices",
    label: "Online Devices",
    icon: Wifi,
    color: "text-success",
    background: "bg-success/10",
  },
  {
    key: "offlineDevices",
    label: "Offline Devices",
    icon: WifiOff,
    color: "text-error",
    background: "bg-error/10",
  },
  {
    key: "totalContents",
    label: "Total Contents",
    icon: Images,
    color: "text-info",
    background: "bg-info/10",
  },
];

export default function DashboardPage() {
  const [devices, setDevices] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const latestStatusRef = useRef(new Map());

  const fetchData = useCallback(async () => {
    try {
      const [deviceResponse, contentResponse] = await Promise.all([
        api.get("/devices"),
        api.get("/contents"),
      ]);

      setDevices(
        deviceResponse.data.data.map((device) => {
          const latestStatus = latestStatusRef.current.get(device.id);

          return latestStatus ? { ...device, ...latestStatus } : device;
        }),
      );

      setContents(contentResponse.data.data);
      setError("");
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  useDeviceStatus(handleDeviceStatus, fetchData);

  const stats = useMemo(
    () => ({
      totalDevices: devices.length,
      onlineDevices: devices.filter((device) => device.status === "online").length,
      offlineDevices: devices.filter((device) => device.status === "offline").length,
      totalContents: contents.length,
    }),
    [devices, contents],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-base-content/60">
          Monitor your digital signage network in real time.
        </p>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.key} className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-base-content/60">{item.label}</p>

                  <div className={`rounded-xl p-3 ${item.background} ${item.color}`}>
                    <Icon size={22} />
                  </div>
                </div>

                {loading ? (
                  <div className="skeleton h-10 w-20" />
                ) : (
                  <p className="text-3xl font-bold">{error ? "—" : stats[item.key]}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Real-Time Monitoring</h2>
          <p className="text-base-content/60">
            Device status updates automatically through Socket.IO.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="badge badge-success badge-soft">{stats.onlineDevices} Online</span>
            <span className="badge badge-error badge-soft">{stats.offlineDevices} Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
