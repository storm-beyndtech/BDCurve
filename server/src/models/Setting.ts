import { Schema, model } from "mongoose";

// Generic key/value store for platform-wide settings (e.g. minimum trade amount).
const settingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: Schema.Types.Mixed,
}, { timestamps: true });

export const Setting = model("Setting", settingSchema);
