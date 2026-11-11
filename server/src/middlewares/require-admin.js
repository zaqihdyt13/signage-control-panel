import { supabase } from "../config/supabase.js";

export async function requireAdmin(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { data, error } = await supabase
      .from("admin_profiles")
      .select("user_id")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!data) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}
