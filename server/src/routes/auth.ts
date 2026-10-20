import { Router } from "express";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { User } from "../models/User.js";
import { Otp } from "../models/Otp.js";
import { authenticate, requireAdmin, signToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { sendMail } from "../services/mailer.js";
import { uploadImage } from "../services/cloudinary.js";
import { NON_ADMIN_FILTER, isReservedAdminEmail } from "../config/admins.js";

const router = Router();

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

async function issueCode(email: string, purpose: "registration" | "password-reset") {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  await Otp.deleteMany({ email: email.toLowerCase(), purpose });
  await Otp.create({ email, codeHash, purpose, expiresAt: new Date(Date.now() + 10 * 60_000) });
  await sendMail(email, `Your Bounding Curve ${purpose === "registration" ? "verification" : "password reset"} code`, `<p>Your code is <strong>${code}</strong>. It expires in 10 minutes.</p>`);
}

async function consumeCode(email: string, code: string, purpose: "registration" | "password-reset") {
  const record = await Otp.findOne({ email: email.toLowerCase(), purpose, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  if (!record || !(await bcrypt.compare(code, record.codeHash))) return false;
  await record.deleteOne();
  return true;
}

router.post("/registration-code", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (isReservedAdminEmail(email)) return res.status(409).json({ message: "This email cannot be used to open a customer account" });
  if (await User.exists({ email })) return res.status(409).json({ message: "An account already exists for this email" });
  await issueCode(email, "registration");
  res.json({ message: "Verification code sent" });
});

router.post("/register", async (req, res) => {
  const { email, password, code, name, countryCode } = req.body;
  if (!email || !password || !code) return res.status(400).json({ message: "Email, password, and verification code are required" });
  if (isReservedAdminEmail(String(email))) return res.status(409).json({ message: "This email cannot be used to open a customer account" });
  if (!(await consumeCode(email, code, "registration"))) return res.status(400).json({ message: "Invalid or expired verification code" });
  if (await User.exists({ email: String(email).toLowerCase() })) return res.status(409).json({ message: "Account already exists" });
  const fullName = typeof name === "string" ? name.trim() : "";
  const [firstName, ...rest] = fullName.split(/\s+/);
  const user = await User.create({
    email,
    passwordHash: await bcrypt.hash(password, 12),
    firstName,
    lastName: rest.join(" "),
    name: { first: firstName, last: rest.join(" "), full: fullName },
    countryCode,
    isVerified: true,
  });
  res.status(201).json({ token: signToken(user), user: user.toJSON() });
});

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(String(req.body.password || ""), user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (user.accountStatus !== "active") return res.status(403).json({ message: "Account is not active" });
  res.json({ token: signToken(user), user: user.toJSON() });
});

router.post("/reset-password-code", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (await User.exists({ email })) await issueCode(email, "password-reset");
  res.json({ message: "If that account exists, a reset code was sent" });
});

router.put("/reset-password", async (req, res) => {
  const { email, code, password, newPassword } = req.body;
  const nextPassword = newPassword || password;
  if (!email || !code || !nextPassword) return res.status(400).json({ message: "Email, code, and new password are required" });
  if (!(await consumeCode(email, code, "password-reset"))) return res.status(400).json({ message: "Invalid or expired reset code" });
  await User.updateOne({ email: String(email).toLowerCase() }, { passwordHash: await bcrypt.hash(nextPassword, 12) });
  res.json({ message: "Password reset successful" });
});

router.get("/users", authenticate, requireAdmin, async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const search = String(req.query.search || "").trim();
  // Admin/staff accounts are not customer profiles: keep them out of user lists and counts.
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const query: Record<string, unknown> = { ...NON_ADMIN_FILTER };
  if (escaped) query.$or = [{ email: { $regex: escaped, $options: "i" } }, { firstName: { $regex: escaped, $options: "i" } }, { lastName: { $regex: escaped, $options: "i" } }];
  const [users, totalUsers] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(query),
  ]);
  res.json({ users, page, limit, totalUsers, totalPages: Math.ceil(totalUsers / limit) });
});

router.get("/users/:id", authenticate, async (req, res) => {
  if (!req.user?.isAdmin && req.user?.role !== "admin" && String(req.user?._id) !== req.params.id) return res.status(403).json({ message: "Forbidden" });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

router.put("/update-user/:id", authenticate, requireAdmin, async (req, res) => {
  const updates = { ...req.body };
  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(String(updates.password), 12);
    delete updates.password;
  }
  delete updates.email;
  delete updates.role;
  delete updates.isAdmin;
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

router.put("/users/update-profile", authenticate, async (req, res) => {
  const allowedFields = [
    "firstName", "lastName", "phone", "countryCode", "country", "dateOfBirth", "dob",
    "houseNo", "streetAddress", "city", "province", "zipCode", "yearsTrading",
    "tradingFrequency", "instruments", "knowledgeLevel", "preferredMarkets",
    "tradingPlatforms", "annualIncome", "incomeSource", "taxResidency",
  ] as const;
  const updates = Object.fromEntries(
    allowedFields.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field)).map((field) => [field, req.body[field]]),
  );
  const firstName = String(updates.firstName ?? req.user!.firstName ?? "").trim();
  const lastName = String(updates.lastName ?? req.user!.lastName ?? "").trim();
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { ...updates, name: { first: firstName, last: lastName, full: `${firstName} ${lastName}`.trim() }, onboardingCompleted: true },
    { new: true, runValidators: true },
  );
  res.json({ user });
});

router.post("/admin/users/:id/dashboard-token", authenticate, requireAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ token: signToken(user) });
});

router.get("/mfa/status", authenticate, (req, res) => res.json({ mfaEnabled: Boolean(req.user?.mfaEnabled) }));
router.post("/mfa/setup", authenticate, async (req, res) => {
  const secret = authenticator.generateSecret();
  await User.updateOne({ _id: req.user!._id }, { mfaSecret: secret, mfaEnabled: false });
  res.json({ otpauthUrl: authenticator.keyuri(req.user!.email, "Bounding Curve", secret) });
});
router.post("/mfa/verify", authenticate, async (req, res) => {
  const user = await User.findById(req.user!._id).select("+mfaSecret");
  if (!user?.mfaSecret || !authenticator.check(String(req.body.token || ""), user.mfaSecret)) return res.status(400).json({ message: "Invalid authenticator code" });
  user.mfaEnabled = true;
  await user.save();
  res.json({ message: "MFA enabled" });
});
router.post("/mfa/disable", authenticate, async (req, res) => {
  const user = await User.findById(req.user!._id).select("+mfaSecret");
  if (!user?.mfaSecret || !authenticator.check(String(req.body.token || ""), user.mfaSecret)) return res.status(400).json({ message: "Invalid authenticator code" });
  user.mfaEnabled = false;
  user.mfaSecret = undefined;
  await user.save();
  res.json({ message: "MFA disabled" });
});

router.put("/complete-kyc", authenticate, upload.fields([{ name: "documentFront", maxCount: 1 }, { name: "documentBack", maxCount: 1 }]), async (req, res) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const frontFile = files?.documentFront?.[0];
  const backFile = files?.documentBack?.[0];
  const [front, back] = await Promise.all([
    frontFile ? uploadImage(frontFile, `kyc/${req.user!._id}`) : undefined,
    backFile ? uploadImage(backFile, `kyc/${req.user!._id}`) : undefined,
  ]);
  const user = await User.findByIdAndUpdate(req.user!._id, {
    ...req.body,
    ...(front ? { documentFront: front.url, documentFrontPublicId: front.publicId } : {}),
    ...(back ? { documentBack: back.url, documentBackPublicId: back.publicId } : {}),
    kycStatus: "pending",
  }, { new: true });
  res.json({ message: "KYC submitted", user });
});
router.put("/approve-kyc/:id", authenticate, requireAdmin, async (req, res) => res.json({ user: await User.findByIdAndUpdate(req.params.id, { kycStatus: "verified" }, { new: true }) }));
router.put("/reject-kyc/:id", authenticate, requireAdmin, async (req, res) => res.json({ user: await User.findByIdAndUpdate(req.params.id, { kycStatus: "rejected" }, { new: true }) }));

export default router;
