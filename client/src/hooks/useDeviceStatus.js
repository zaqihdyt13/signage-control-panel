import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { supabase } from "../lib/supabase";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export function useDeviceStatus(onStatusChange, onReconnect) {
  const callbacksRef = useRef({
    onStatusChange,
    onReconnect,
  });

  useEffect(() => {
    callbacksRef.current = {
      onStatusChange,
      onReconnect,
    };
  });

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      reconnection: true,
    });

    const handleConnect = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session?.access_token) {
        console.error("Admin session not available");
        return;
      }

      socket.emit(
        "devices:subscribe",
        {
          token: data.session.access_token,
        },
        (response) => {
          if (!response?.success) {
            console.error("Admin subscription failed:", response?.message);
            return;
          }

          onReconnect?.();
        },
      );
    };

    const handleStatusChange = (updatedDevice) => {
      callbacksRef.current.onStatusChange?.(updatedDevice);
    };

    socket.on("connect", handleConnect);
    socket.on("device:status", handleStatusChange);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("device:status", handleStatusChange);
      socket.disconnect();
    };
  }, []);
}
