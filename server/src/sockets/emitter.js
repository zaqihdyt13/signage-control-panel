let ioInstance = null;

export function setSocketServer(io) {
  ioInstance = io;
}

export function getSocketServer() {
  if (!ioInstance) {
    throw new Error("Socket.IO server is not initialized");
  }

  return ioInstance;
}

export async function disconnectDevice(deviceId, reason = "removed") {
  const io = getSocketServer();
  const room = `device:${deviceId}`;

  const event = reason === "rotated" ? "device:credentials-revoked" : "device:removed";

  const sockets = await io.in(room).fetchSockets();

  await Promise.all(
    sockets.map(async (socket) => {
      try {
        await socket.timeout(3000).emitWithAck(event, { deviceId });
      } catch (error) {
        console.warn(`Device disconnect acknowledgement failed: ${socket.id}`, error.message);
      } finally {
        socket.disconnect(true);
      }
    }),
  );
}
