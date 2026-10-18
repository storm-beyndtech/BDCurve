import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const assetSchema = new Schema({
  symbol: { type: String, required: true, uppercase: true },
  name: String,
  spot: { type: Number, default: 0 },
  funding: { type: Number, default: 0 },
}, { _id: false });

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  name: { first: String, last: String, full: String },
  firstName: String,
  lastName: String,
  phone: String,
  countryCode: String,
  country: String,
  dateOfBirth: String,
  dob: String,
  houseNo: String,
  streetAddress: String,
  city: String,
  province: String,
  zipCode: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  onboardingCompleted: { type: Boolean, default: false },
  kycStatus: { type: String, enum: ["not_submitted", "pending", "verified", "rejected"], default: "not_submitted" },
  accountStatus: { type: String, enum: ["active", "suspended", "deactivated"], default: "active" },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, select: false },
  withdrawalPasswordHash: { type: String, select: false },
  yearsTrading: String,
  tradingFrequency: String,
  instruments: String,
  knowledgeLevel: String,
  preferredMarkets: String,
  tradingPlatforms: String,
  annualIncome: String,
  incomeSource: String,
  taxResidency: String,
  accountNumber: String,
  routingNumber: String,
  withdrawalsDisabled: { type: Boolean, default: false },
  withdrawalsDisabledReason: String,
  documentFront: String,
  documentFrontPublicId: String,
  documentBack: String,
  documentBackPublicId: String,
  documentNumber: String,
  documentType: String,
  documentExpDate: String,
  assets: { type: [assetSchema], default: [{ symbol: "USDT", name: "Tether", spot: 0, funding: 0 }] },
  copiedTraders: [{ type: Schema.Types.ObjectId, ref: "Trader" }],
}, { timestamps: true, minimize: false });

userSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret.passwordHash;
    delete ret.mfaSecret;
    delete ret.withdrawalPasswordHash;
    return ret;
  },
});

export type UserShape = InferSchemaType<typeof userSchema>;
export type IUser = HydratedDocument<UserShape>;
export const User = model<UserShape>("User", userSchema);
