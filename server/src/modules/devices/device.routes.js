import { Router } from "express";
import * as controller from "./device.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  createDeviceSchema,
  updateDeviceSchema,
  deviceIdSchema,
  pushContentSchema,
} from "./device.schema.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { requireAdmin } from "../../middlewares/require-admin.js";
import { requireDeviceAuth } from "../../middlewares/require-device-auth.js";

const router = Router();

router.get("/:id", validate(deviceIdSchema, "params"), requireDeviceAuth, controller.show);

router.get(
  "/:id/active-content",
  validate(deviceIdSchema, "params"),
  requireDeviceAuth,
  controller.showActiveContent,
);

router.use(requireAuth, requireAdmin);

router.get("/", controller.index);

router.post("/", validate(createDeviceSchema), controller.store);

router.post(
  "/:id/push",
  validate(deviceIdSchema, "params"),
  validate(pushContentSchema),
  controller.push,
);

router.post("/:id/token", validate(deviceIdSchema, "params"), controller.generateToken);

router.patch(
  "/:id",
  validate(deviceIdSchema, "params"),
  validate(updateDeviceSchema),
  controller.update,
);

router.delete("/:id", validate(deviceIdSchema, "params"), controller.destroy);

export default router;
