import AuditLog from "../models/AuditLogs.js";

export const logAction = (actionType, descriptionBuilder) => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      try {

        const actor =
          req.admin ||
          req.agent ||
          req.traffic ||
          req.user;

        if (!actor) return; 

        const description =
          typeof descriptionBuilder === "function"
            ? descriptionBuilder(req)
            : descriptionBuilder;

        await AuditLog.create({
          actorId: actor.id,
          role: actor.role || "unknown",
          actionType,
          description,
          statusCode: res.statusCode,
          ipAddress:
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress ||
            "Unknown",
          userAgent: req.headers["user-agent"]
        });

      } catch (err) {
        console.error("❌ AuditLog Failed:", err.message);
      }
    });

    next();
  };
};