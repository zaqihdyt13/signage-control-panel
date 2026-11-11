import { getSocketServer } from "../../../sockets/emitter.js";
import { getDeviceById, setActiveContent } from "./device.service.js";
import { getContentById } from "../../contents/content.service.js";

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function pushContent(deviceId, contentId) {
  const device = await getDeviceById(deviceId);

  if (!device) {
    throw httpError(404, "Device not found");
  }

  const content = await getContentById(contentId);

  if (!content) {
    throw httpError(404, "Content not found");
  }

  const updatedDevice = await setActiveContent(deviceId, contentId);

  if (!updatedDevice) {
    throw httpError(404, "Device not found");
  }

  const io = getSocketServer();
  const room = `device:${deviceId}`;
  const sockets = await io.in(room).fetchSockets();

  let delivered = false;
  let acknowledgedConnections = 0;

  if (sockets.length > 0) {
    try {
      const responses = await io
        .to(room)
        .timeout(10000)
        .emitWithAck("content:display", { content });

      acknowledgedConnections = responses.filter((response) => response?.success).length;

      delivered = acknowledgedConnections === sockets.length;
    } catch (error) {
      console.warn("Push delivery incomplete:", error.message);
    }
  }

  return {
    deviceId,
    contentId,
    saved: true,
    delivered,
    acknowledgedConnections,
  };
}
