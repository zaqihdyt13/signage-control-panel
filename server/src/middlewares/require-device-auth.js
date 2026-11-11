import { getDeviceById } from "../modules/devices/services/device.service.js";
import { verifyDeviceToken } from "../modules/devices/utils/device-token.js";

export async function requireDeviceAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Device authentication required",
      });
    }

    const token = authorization.slice(7).trim();

    const device = await getDeviceById(req.params.id);

    if (!device || !verifyDeviceToken(token, device.token_hash)) {
      return res.status(401).json({
        success: false,
        message: "Invalid device credentials",
      });
    }

    req.device = device;

    next();
  } catch (error) {
    next(error);
  }
}
