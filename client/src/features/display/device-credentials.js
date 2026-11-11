const getTokenKey = (deviceId) => `signage:device-token:${deviceId}`;

export function getDeviceToken(deviceId) {
  try {
    return localStorage.getItem(getTokenKey(deviceId));
  } catch {
    return null;
  }
}

export function saveDeviceToken(deviceId, token) {
  localStorage.setItem(getTokenKey(deviceId), token);
}

export function clearDeviceToken(deviceId) {
  localStorage.removeItem(getTokenKey(deviceId));
}
