import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function generateDeviceToken() {
  return randomBytes(32).toString("hex");
}

export function hashDeviceToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyDeviceToken(token, storedHash) {
  if (typeof token !== "string" || typeof storedHash !== "string") {
    return false;
  }

  const providedHash = Buffer.from(hashDeviceToken(token), "hex");

  const expectedHash = Buffer.from(storedHash, "hex");

  if (providedHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(providedHash, expectedHash);
}
