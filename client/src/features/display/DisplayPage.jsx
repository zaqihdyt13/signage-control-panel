import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import ContentRenderer from "./components/ContentRenderer";
import { setCachedContent } from "./display-cache";
import { displayApi } from "./display.api";
import DeviceTokenSetup from "./components/DeviceTokenSetup";
import { getDeviceToken, saveDeviceToken, clearDeviceToken } from "./device-credentials";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export default function DisplayPage() {
  const { id } = useParams();

  const [device, setDevice] = useState(null);
  const [activeContent, setActiveContent] = useState(null);
  const [connected, setConnected] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [deviceToken, setDeviceToken] = useState(() => getDeviceToken(id));
  const [invalidToken, setInvalidToken] = useState(false);
  const [error, setError] = useState("");

  const handleTokenSubmit = (token) => {
    saveDeviceToken(id, token);

    setDeviceToken(token);
    setInvalidToken(false);
    setError("");
  };

  const handleResetToken = () => {
    clearDeviceToken(id);
    setDeviceToken(null);

    setDevice(null);
    setActiveContent(null);
    setCachedContent(id, null);

    setConnected(false);
    setRegistered(false);
    setInvalidToken(false);
    setError("");
  };

  useEffect(() => {
    if (!deviceToken) {
      return;
    }

    let active = true;
    let isRegistered = false;
    let contentVersion = 0;

    const socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const applyContent = (content) => {
      if (!active) return;

      contentVersion += 1;

      setActiveContent(content);
      setCachedContent(id, content);
    };

    const syncActiveContent = async () => {
      const versionAtStart = contentVersion;

      try {
        const content = await displayApi.getActiveContent(id, deviceToken);

        if (!active) return;
        if (versionAtStart !== contentVersion) return;

        applyContent(content);
      } catch (error) {
        console.warn("Active content sync failed:", error);
      }
    };

    const syncDevice = async () => {
      try {
        const result = await displayApi.getDevice(id, deviceToken);

        if (active) {
          setDevice(result);
        }
      } catch (error) {
        console.warn("Device information sync failed:", error);
      }
    };

    const handleContentDisplay = (payload, acknowledge) => {
      const content = payload?.content;

      if (
        !content?.id ||
        !["image", "video", "url"].includes(content.type) ||
        typeof content.payload !== "string"
      ) {
        acknowledge?.({
          success: false,
          message: "Invalid content",
        });
        return;
      }

      applyContent(content);

      acknowledge?.({
        success: true,
        message: "Content received",
      });
    };

    const handleContentClear = () => {
      applyContent(null);
    };

    const handleConnect = () => {
      if (!active) return;

      setConnected(true);
      setRegistered(false);
      setError("");
      isRegistered = false;

      socket.timeout(10000).emit(
        "device:register",
        {
          deviceId: id,
          token: deviceToken,
        },
        async (err, response) => {
          if (!active || !socket.connected) return;

          if (err || !response?.success) {
            const message = response?.message || "Device registration failed.";

            setRegistered(false);
            setActiveContent(null);
            setError(message);

            if (!err && message === "Invalid device credentials") {
              setInvalidToken(true);
              socket.disconnect();
            }

            return;
          }

          isRegistered = true;
          setRegistered(true);
          setError("");

          await Promise.all([syncDevice(), syncActiveContent()]);
        },
      );
    };

    const handleDisconnect = () => {
      if (!active) return;

      isRegistered = false;
      setConnected(false);
      setRegistered(false);
    };

    const handleConnectError = () => {
      if (!active) return;

      setConnected(false);
      setRegistered(false);
      setError("Unable to connect to signage server.");
    };

    const handleDeviceRemoved = (payload, acknowledge) => {
      applyContent(null);
      setRegistered(false);
      setError("This device has been removed.");

      acknowledge?.({ success: true });

      socket.disconnect();
    };

    const handleCredentialsRevoked = (_payload, acknowledge) => {
      acknowledge?.({ success: true });

      socket.disconnect();

      clearDeviceToken(id);
      setDeviceToken(null);

      setDevice(null);
      setActiveContent(null);
      setCachedContent(id, null);

      setConnected(false);
      setRegistered(false);
      setInvalidToken(false);
      setError("");
    };

    socket.on("device:credentials-revoked", handleCredentialsRevoked);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("content:display", handleContentDisplay);
    socket.on("content:clear", handleContentClear);
    socket.on("device:removed", handleDeviceRemoved);

    const heartbeat = setInterval(() => {
      if (socket.connected && isRegistered) {
        socket.emit("device:heartbeat");
      }
    }, 30000);

    socket.connect();

    return () => {
      active = false;
      clearInterval(heartbeat);
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [id, deviceToken]);

  if (!deviceToken) {
    return <DeviceTokenSetup deviceId={id} onSubmit={handleTokenSubmit} />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <ContentRenderer
          key={activeContent ? `${activeContent.id}:${activeContent.payload}` : "empty"}
          content={activeContent}
        />
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 rounded-xl bg-black/70 px-4 py-3 backdrop-blur-sm">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            connected && registered ? "bg-green-400" : "bg-red-400"
          }`}
        />

        <div>
          <p className="text-sm font-medium">{device?.name ?? "Device Simulator"}</p>

          <p className="text-xs text-white/60">
            {connected && registered ? "Connected" : "Disconnected"}
          </p>
        </div>

        <button
          type="button"
          className="btn btn- btn-sm text-white"
          onClick={handleResetToken}
          title="Change device token"
        >
          Change Token
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="absolute right-4 top-4 z-10 rounded-lg bg-red-600 px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      {invalidToken && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 px-4">
          <div className="card w-full max-w-md bg-base-100 text-base-content shadow-xl">
            <div className="card-body gap-4">
              <h2 className="text-xl font-bold">Invalid Device Token</h2>

              <p className="text-sm text-base-content/70">
                The provided device token is invalid or has been revoked. Please enter a valid token
                to reconnect.
              </p>

              <button type="button" className="btn btn-primary" onClick={handleResetToken}>
                Change Device Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
