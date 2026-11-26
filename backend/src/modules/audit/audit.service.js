import AuditLog from "./audit.model.js";

export async function writeAudit(entry) {
  try {
    await AuditLog.create(entry);
  } catch (err) {
    console.error("audit log failed:", err.message);
  }
}
