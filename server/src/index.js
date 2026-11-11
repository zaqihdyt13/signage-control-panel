import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { setupSocket } from "./sockets/index.js";
import { resetDevicePresence } from "./modules/devices/services/device.service.js";
import { setSocketServer } from "./sockets/emitter.js";

const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

setSocketServer(io);

async function startServer() {
  try {
    await resetDevicePresence();

    setupSocket(io);

    httpServer.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
