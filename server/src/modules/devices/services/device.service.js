import { supabase } from "../../../config/supabase.js";

const TABLE = "devices";

const handleDbError = (error) => {
  if (error) {
    console.error("Supabase Database Error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    const err = new Error("Database operation failed");
    err.statusCode = 500;
    throw err;
  }
};

export const getDevices = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, name, location, status, last_seen, created_at, updated_at, active_content_id")
    .order("created_at", { ascending: false });

  handleDbError(error);
  return data;
};

export const getDeviceById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();

  handleDbError(error);
  return data;
};

export const createDevice = async (payload) => {
  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

  handleDbError(error);
  return data;
};

export const getDevicesByActiveContent = async (contentId) => {
  const { data, error } = await supabase
    .from("devices")
    .select("id")
    .eq("active_content_id", contentId);

  handleDbError(error);

  return data ?? [];
};

export const updateDevice = async (id, payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();

  handleDbError(error);
  return data;
};

export const deleteDevice = async (id) => {
  const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select().maybeSingle();

  handleDbError(error);
  return data;
};

export const updateDevicePresence = async (id, status) => {
  const { data, error } = await supabase
    .from("devices")
    .update({
      status,
      last_seen: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  handleDbError(error);
  return data;
};

export const updateDeviceLastSeen = async (id) => {
  const { error } = await supabase
    .from("devices")
    .update({
      last_seen: new Date().toISOString(),
    })
    .eq("id", id);

  handleDbError(error);
};

export const resetDevicePresence = async () => {
  const { error } = await supabase
    .from("devices")
    .update({
      status: "offline",
    })
    .eq("status", "online");

  handleDbError(error);
};

export async function updateDeviceTokenHash(deviceId, tokenHash) {
  const { data, error } = await supabase
    .from("devices")
    .update({
      token_hash: tokenHash,
    })
    .eq("id", deviceId)
    .select("id")
    .maybeSingle();

  handleDbError(error);

  return data;
}

export const getActiveContent = async (deviceId) => {
  const { data, error } = await supabase
    .from("devices")
    .select(
      `
      id,
      active_content_id,
      content:contents!devices_active_content_id_fkey (
        id,
        title,
        type,
        payload,
        created_at,
        updated_at
      )
    `,
    )
    .eq("id", deviceId)
    .maybeSingle();

  handleDbError(error);

  if (!data) return undefined;

  return data.content ?? null;
};

export const setActiveContent = async (deviceId, contentId) => {
  const { data, error } = await supabase
    .from("devices")
    .update({
      active_content_id: contentId,
    })
    .eq("id", deviceId)
    .select()
    .maybeSingle();

  handleDbError(error);
  return data;
};
