import { api } from "../../lib/api";

export const deviceApi = {
  generateToken: async (deviceId) => {
    const response = await api.post(`/devices/${deviceId}/token`);

    return response.data.data;
  },

  getAll: async () => {
    const response = await api.get("/devices");
    return response.data.data;
  },

  create: async (payload) => {
    const response = await api.post("/devices", payload);
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/devices/${id}`);
    return response.data.data;
  },

  update: async (id, payload) => {
    const response = await api.patch(`/devices/${id}`, payload);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/devices/${id}`);
  },

  pushContent: async (deviceId, contentId) => {
    const response = await api.post(`/devices/${deviceId}/push`, { contentId });

    return response.data.data;
  },

  getActiveContent: async (deviceId) => {
    const response = await api.get(`/devices/${deviceId}/active-content`);

    return response.data.data;
  },
};
