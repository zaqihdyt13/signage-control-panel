import { z } from "zod";

const deviceFields = {
  name: z.string().trim().min(1).max(100),
  location: z.string().trim().min(1).max(255),
};

export const createDeviceSchema = z.object(deviceFields).strict();

export const updateDeviceSchema = createDeviceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const deviceIdSchema = z.object({
  id: z.uuid(),
});

export const pushContentSchema = z
  .object({
    contentId: z.uuid(),
  })
  .strict();
