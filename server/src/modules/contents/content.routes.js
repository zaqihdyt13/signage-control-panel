import { Router } from "express";
import * as controller from "./content.controller.js";
import { validate } from "../../middlewares/validate.js";
import { upload } from "../../middlewares/upload.js";
import { createContentSchema, updateContentSchema, contentIdSchema } from "./content.schema.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { requireAdmin } from "../../middlewares/require-admin.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", controller.index);

router.post("/upload", upload.single("file"), controller.upload);

router.get("/:id", validate(contentIdSchema, "params"), controller.show);

router.post("/", validate(createContentSchema), controller.store);

router.patch(
  "/:id",
  validate(contentIdSchema, "params"),
  validate(updateContentSchema),
  controller.update,
);

router.delete("/:id", validate(contentIdSchema, "params"), controller.destroy);

export default router;
