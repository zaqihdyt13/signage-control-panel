import * as deviceService from "./services/device.service.js";
import { pushContent } from "./services/device-push.service.js";
import { disconnectDevice } from "../../sockets/emitter.js";
import { provisionDeviceToken } from "./services/device-token.service.js";

export const generateToken = async (req, res) => {
  const result = await provisionDeviceToken(req.params.id);

  await disconnectDevice(req.params.id, "rotated");

  res.setHeader("Cache-Control", "no-store");

  res.json({
    success: true,
    message: "Device token generated successfully",
    data: result,
  });
};

export const index = async (req, res) => {
  const devices = await deviceService.getDevices();

  res.json({
    success: true,
    data: devices,
  });
};

export const show = async (req, res) => {
  const device = await deviceService.getDeviceById(req.params.id);

  if (!device) {
    return res.status(404).json({
      success: false,
      message: "Device not found",
    });
  }

  res.json({
    success: true,
    data: device,
  });
};

export const store = async (req, res) => {
  const device = await deviceService.createDevice(req.body);

  res.status(201).json({
    success: true,
    message: "Device created successfully",
    data: device,
  });
};

export const update = async (req, res) => {
  const device = await deviceService.updateDevice(req.params.id, req.body);

  if (!device) {
    return res.status(404).json({
      success: false,
      message: "Device not found",
    });
  }

  res.json({
    success: true,
    message: "Device updated successfully",
    data: device,
  });
};

export const destroy = async (req, res) => {
  const deviceId = req.params.id;

  const device = await deviceService.deleteDevice(deviceId);

  if (!device) {
    return res.status(404).json({
      success: false,
      message: "Device not found",
    });
  }

  await disconnectDevice(deviceId, "removed");

  res.json({
    success: true,
    message: "Device deleted successfully",
  });
};

export const push = async (req, res) => {
  const result = await pushContent(req.params.id, req.body.contentId);

  res.json({
    success: true,
    message: "Content assignment saved",
    data: result,
  });
};

export const showActiveContent = async (req, res) => {
  const content = await deviceService.getActiveContent(req.params.id);

  if (content === undefined) {
    return res.status(404).json({
      success: false,
      message: "Device not found",
    });
  }

  res.json({
    success: true,
    data: content,
  });
};
