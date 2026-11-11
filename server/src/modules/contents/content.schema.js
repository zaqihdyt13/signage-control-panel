import { z } from "zod";

const contentFields = {
  title: z.string().trim().min(1).max(150),
  type: z.enum(["image", "video", "url"]),
  payload: z
    .url()
    .max(2048)
    .refine(
      (value) => ["http:", "https:"].includes(new URL(value).protocol),
      "Only HTTP or HTTPS URLs are allowed",
    ),
};

export const createContentSchema = z.object(contentFields).strict();

export const updateContentSchema = z
  .object(contentFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const contentIdSchema = z.object({
  id: z.uuid(),
});

export const uploadContentSchema = z.object({
  title: z.string().trim().min(1).max(150),
});
