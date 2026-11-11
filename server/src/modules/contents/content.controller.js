import * as contentService from "./content.service.js";
import { uploadContentSchema } from "./content.schema.js";
import { getSocketServer } from "../../sockets/emitter.js";
import { getDevicesByActiveContent } from "../devices/services/device.service.js";

export const index = async (req, res) => {
  const contents = await contentService.getContents();

  res.json({
    success: true,
    data: contents,
  });
};

export const show = async (req, res) => {
  const content = await contentService.getContentById(req.params.id);

  if (!content) {
    return res.status(404).json({
      success: false,
      message: "Content not found",
    });
  }

  res.json({
    success: true,
    data: content,
  });
};

export const store = async (req, res) => {
  const content = await contentService.createContent(req.body);

  res.status(201).json({
    success: true,
    message: "Content created successfully",
    data: content,
  });
};

export const update = async (req, res) => {
  const content = await contentService.updateContent(req.params.id, req.body);

  if (!content) {
    return res.status(404).json({
      success: false,
      message: "Content not found",
    });
  }

  const affectedDevices = await getDevicesByActiveContent(content.id);

  const io = getSocketServer();

  for (const device of affectedDevices) {
    io.to(`device:${device.id}`).emit("content:display", {
      content,
    });
  }

  res.json({
    success: true,
    message: "Content updated successfully",
    data: content,
  });
};

export const destroy = async (req, res) => {
  const contentId = req.params.id;

  const affectedDevices = await getDevicesByActiveContent(contentId);

  await contentService.deleteContent(contentId);

  const io = getSocketServer();

  for (const device of affectedDevices) {
    io.to(`device:${device.id}`).emit("content:clear");
  }

  res.json({
    success: true,
    message: "Content deleted successfully",
  });
};

export const upload = async (req, res) => {
  const parsed = uploadContentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten(),
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File is required",
    });
  }

  const content = await contentService.uploadContent({
    title: parsed.data.title,
    file: req.file,
  });

  res.status(201).json({
    success: true,
    message: "Content uploaded successfully",
    data: content,
  });
};
