import { generateDeviceToken, hashDeviceToken } from "../utils/device-token.js";

import { getDeviceById, updateDeviceTokenHash } from "./device.service.js";

export async function provisionDeviceToken(deviceId) {
  const device = await getDeviceById(deviceId);

  if (!device) {
    const error = new Error("Device not found");
    error.statusCode = 404;
    throw error;
  }

  const token = generateDeviceToken();
  const tokenHash = hashDeviceToken(token);

  await updateDeviceTokenHash(deviceId, tokenHash);

  return {
    deviceId,
    token,
  };
}
