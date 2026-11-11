import * as deviceService from "../modules/devices/services/device.service.js";
import { verifyDeviceToken } from "../modules/devices/utils/device-token.js";
import { supabase } from "../config/supabase.js";

const deviceConnections = new Map();
const deviceQueues = new Map();

function queueDeviceOperation(deviceId, operation) {
  const previous = deviceQueues.get(deviceId) ?? Promise.resolve();

  const current = previous.catch(() => {}).then(operation);

  const settled = current.catch(() => {});
  deviceQueues.set(deviceId, settled);

  settled.finally(() => {
    if (deviceQueues.get(deviceId) === settled) {
      deviceQueues.delete(deviceId);
    }
  });

  return current;
}

export function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("devices:subscribe", async (payload, callback) => {
      try {
        const token = payload?.token;

        if (typeof token !== "string" || !token) {
          callback?.({
            success: false,
            message: "Authentication required",
          });
          return;
        }

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
          callback?.({
            success: false,
            message: "Invalid access token",
          });
          return;
        }

        const { data: admin, error: adminError } = await supabase
          .from("admin_profiles")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (adminError || !admin) {
          callback?.({
            success: false,
            message: "Admin access required",
          });
          return;
        }

        socket.join("admins");

        callback?.({
          success: true,
        });
      } catch (error) {
        console.error("Admin subscription failed:", error);

        callback?.({
          success: false,
          message: "Subscription failed",
        });
      }
    });

    socket.on("device:register", async (payload, callback) => {
      const deviceId = payload?.deviceId;

      if (
        typeof deviceId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deviceId)
      ) {
        callback?.({
          success: false,
          message: "Invalid device ID",
        });
        return;
      }

      if (socket.data.deviceId && socket.data.deviceId !== deviceId) {
        callback?.({
          success: false,
          message: "Socket already registered to another device",
        });
        return;
      }

      try {
        await queueDeviceOperation(deviceId, async () => {
          const device = await deviceService.getDeviceById(deviceId);

          if (!device) {
            callback?.({
              success: false,
              message: "Device not found",
            });
            return;
          }

          if (socket.disconnected) return;

          let connections = deviceConnections.get(deviceId);

          if (!connections) {
            connections = new Set();
            deviceConnections.set(deviceId, connections);
          }

          const wasOffline = connections.size === 0;

          const token = payload?.token;

          if (!device.token_hash || !verifyDeviceToken(token, device.token_hash)) {
            callback?.({
              success: false,
              message: "Invalid device credentials",
            });

            return;
          }

          connections.add(socket.id);
          socket.data.deviceId = deviceId;
          socket.join(`device:${deviceId}`);

          if (wasOffline) {
            const updatedDevice = await deviceService.updateDevicePresence(deviceId, "online");

            if (updatedDevice) {
              io.to("admins").emit("device:status", updatedDevice);
            }
          }

          callback?.({
            success: true,
            message: "Device registered",
          });

          socket.emit("device:registered", {
            deviceId,
            status: "online",
          });
        });
      } catch (error) {
        console.error("Device registration error:", error);

        callback?.({
          success: false,
          message: "Device registration failed",
        });
      }
    });

    socket.on("device:heartbeat", async () => {
      const deviceId = socket.data.deviceId;

      if (!deviceId) return;

      try {
        await deviceService.updateDeviceLastSeen(deviceId);
      } catch (error) {
        console.error("Heartbeat error:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);

      const deviceId = socket.data.deviceId;

      if (!deviceId) return;

      queueDeviceOperation(deviceId, async () => {
        const connections = deviceConnections.get(deviceId);

        if (!connections) return;

        connections.delete(socket.id);

        if (connections.size > 0) return;

        deviceConnections.delete(deviceId);

        const updatedDevice = await deviceService.updateDevicePresence(deviceId, "offline");

        if (updatedDevice) {
          io.to("admins").emit("device:status", updatedDevice);
        }
      }).catch((error) => {
        console.error("Device disconnect error:", error);
      });
    });
  });
}
