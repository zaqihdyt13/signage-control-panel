const getCacheKey = (deviceId) => `signage:active-content:${deviceId}`;

export function getCachedContent(deviceId) {
  try {
    const value = localStorage.getItem(getCacheKey(deviceId));

    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function setCachedContent(deviceId, content) {
  try {
    if (content) {
      localStorage.setItem(getCacheKey(deviceId), JSON.stringify(content));
    } else {
      localStorage.removeItem(getCacheKey(deviceId));
    }
  } catch (error) {
    console.warn("Unable to update content cache:", error);
  }
}
