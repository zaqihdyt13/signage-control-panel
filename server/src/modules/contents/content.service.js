import { randomUUID } from "node:crypto";
import path from "node:path";
import { supabase } from "../../config/supabase.js";

const TABLE = "contents";
const BUCKET = "signage-contents";

const handleDbError = (error) => {
  if (error) {
    const err = new Error("Database operation failed");
    err.statusCode = 500;
    throw err;
  }
};

const getStoragePath = (payload) => {
  const prefix = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

  if (!payload?.startsWith(prefix)) return null;

  const storagePath = payload.slice(prefix.length);

  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$/i.test(storagePath)) {
    return null;
  }

  return storagePath;
};

const removeStorageFile = async (storagePath) => {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);

  if (error) {
    console.error("Storage cleanup failed:", error.message);
  }
};

export const getContents = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  handleDbError(error);
  return data;
};

export const getContentById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();

  handleDbError(error);
  return data;
};

export const createContent = async (payload) => {
  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

  handleDbError(error);
  return data;
};

export const uploadContent = async ({ title, file }) => {
  const isImage = file.mimetype.startsWith("image/");
  const type = isImage ? "image" : "video";

  const extensions = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
  };

  const extension = extensions[file.mimetype];
  const filename = `${randomUUID()}${extension}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filename, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (uploadError) {
    throw new Error("Failed to upload content");
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  try {
    return await createContent({
      title,
      type,
      payload: urlData.publicUrl,
    });
  } catch (error) {
    await removeStorageFile(filename);
    throw error;
  }
};

export const updateContent = async (id, payload) => {
  const existingContent = await getContentById(id);

  if (!existingContent) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();

  handleDbError(error);

  if (data && payload.payload && payload.payload !== existingContent.payload) {
    const oldStoragePath = getStoragePath(existingContent.payload);

    if (oldStoragePath) {
      await removeStorageFile(oldStoragePath);
    }
  }

  return data;
};

export const deleteContent = async (id) => {
  const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select().maybeSingle();

  handleDbError(error);

  if (data) {
    const storagePath = getStoragePath(data.payload);

    if (storagePath) {
      await removeStorageFile(storagePath);
    }
  }

  return data;
};
