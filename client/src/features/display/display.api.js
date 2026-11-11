import axios from "axios";

const deviceClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 10000,
});

export const displayApi = {
  getDevice: async (deviceId, token) => {
    const response = await deviceClient.get(`/devices/${deviceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  },

  getActiveContent: async (deviceId, token) => {
    const response = await deviceClient.get(`/devices/${deviceId}/active-content`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  },
};
