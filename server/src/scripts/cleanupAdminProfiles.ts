/**
 * One-off cleanup: admin accounts must not double as customer profiles.
 *
 *   npm run build && node dist/scripts/cleanupAdminProfiles.js            # dry run (default)
 *   node dist/scripts/cleanupAdminProfiles.js --apply                      # make changes
 *
 * Reserved admin emails come from ADMIN_SEED_EMAIL and ADMIN_EMAILS (comma separated).
 * - Admin accounts (isAdmin/role=admin): customer-only data (zero balances, KYC/onboarding) is reset.
 *   Non-zero balances are only reported, never wiped.
 * - Non-admin duplicates using a reserved admin email: deleted only if they have no transactions.
 */
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { reservedAdminEmails } from "../config/admins.js";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";

const apply = process.argv.includes("--apply");

try {
  await mongoose.connect(env.MONGODB_URI);
  const admins = await User.find({ $or: [{ isAdmin: true }, { role: "admin" }] });
  for (const admin of admins) {
    const hasBalance = (admin.assets || []).some((asset: any) => Number(asset.spot) || Number(asset.funding));
    console.info(`[admin] ${admin.email} balance=${hasBalance ? "NON-ZERO (left untouched, review manually)" : "zero"}`);
    if (apply && !hasBalance) {
      await User.updateOne({ _id: admin._id }, { $set: { assets: [], onboardingCompleted: true }, $unset: { kycStatus: 1 } }, { strict: false });
    }
  }

  const reserved = reservedAdminEmails();
  const duplicates = reserved.length ? await User.find({ email: { $in: reserved }, isAdmin: { $ne: true }, role: { $ne: "admin" } }) : [];
  for (const dup of duplicates) {
    const txCount = await Transaction.countDocuments({ userId: dup._id });
    console.info(`[duplicate] ${dup.email} (${dup._id}) transactions=${txCount}${txCount ? " -> kept, review manually" : apply ? " -> deleted" : " -> would delete"}`);
    if (apply && !txCount) await dup.deleteOne();
  }
  console.info(apply ? "Cleanup applied." : "Dry run only. Re-run with --apply to make changes.");
} finally {
  await mongoose.disconnect();
}
