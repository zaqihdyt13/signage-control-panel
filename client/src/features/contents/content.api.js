import { api } from "../../lib/api";

export const contentApi = {
  getAll: async () => {
    const response = await api.get("/contents");
    return response.data.data;
  },

  create: async (payload) => {
    const response = await api.post("/contents", payload);
    return response.data.data;
  },

  upload: async ({ title, file }) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    const response = await api.post("/contents/upload", formData, {
      timeout: 120000,
    });

    return response.data.data;
  },

  update: async (id, payload) => {
    const response = await api.patch(`/contents/${id}`, payload);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/contents/${id}`);
  },
};
