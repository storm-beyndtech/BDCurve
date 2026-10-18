import { Schema, model } from "mongoose";

const walletSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  address: { type: String, required: true },
  provider: String,
  network: String,
  status: { type: String, default: "connected" },
}, { timestamps: true });

const auditLogSchema = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true, index: true },
  targetType: String,
  targetId: String,
  metadata: Schema.Types.Mixed,
}, { timestamps: true });

const emailLogSchema = new Schema({
  recipients: [String],
  subject: String,
  status: { type: String, default: "sent" },
  error: String,
  sentBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Wallet = model("Wallet", walletSchema);
export const AuditLog = model("AuditLog", auditLogSchema);
export const EmailLog = model("EmailLog", emailLogSchema);
