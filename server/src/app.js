import express from "express";
import cors from "cors";
import deviceRoutes from "./modules/devices/device.routes.js";
import contentRoutes from "./modules/contents/content.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Signage API is running",
  });
});

app.use("/api/devices", deviceRoutes);
app.use("/api/contents", contentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;
