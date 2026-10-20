import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { Trader } from "../models/Trading.js";
import { User } from "../models/User.js";
import { uploadImage } from "../services/cloudinary.js";

const router = Router();

router.get("/", async (_req, res) => res.json(await Trader.find().sort({ createdAt: -1 })));
router.get("/my-traders", authenticate, async (req, res) => {
  const user = await User.findById(req.user!._id).populate("copiedTraders");
  res.json(user?.copiedTraders || []);
});

router.post("/create", authenticate, requireAdmin, upload.single("profileImage"), async (req, res) => {
  const image = req.file ? await uploadImage(req.file, "traders") : undefined;
  const trader = await Trader.create(normalize(req.body, image));
  res.status(201).json(trader);
});
router.put("/:id", authenticate, requireAdmin, upload.single("profileImage"), async (req, res) => {
  const image = req.file ? await uploadImage(req.file, "traders") : undefined;
  const trader = await Trader.findByIdAndUpdate(req.params.id, normalize(req.body, image), { new: true, runValidators: true });
  if (!trader) return res.status(404).json({ message: "Trader not found" });
  res.json(trader);
});
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  const trader = await Trader.findByIdAndDelete(req.params.id);
  if (!trader) return res.status(404).json({ message: "Trader not found" });
  await User.updateMany({}, { $pull: { copiedTraders: trader._id } });
  res.json({ message: "Trader deleted" });
});
router.post("/:id/copy", authenticate, async (req, res) => {
  const trader = await Trader.findById(req.params.id);
  if (!trader) return res.status(404).json({ message: "Trader not found" });
  if (trader.status === "inactive") return res.status(400).json({ message: "This trader is not accepting copiers" });
  const minimum = Number(trader.minimumCopyAmount || 0);
  const copier = await User.findById(req.user!._id);
  if (!copier) return res.status(404).json({ message: "User not found" });
  const usdt = Number(copier.assets.find((asset) => asset.symbol === "USDT")?.spot || 0);
  const requested = Number(req.body?.amount);
  const amount = Number.isFinite(requested) && requested > 0 ? requested : usdt;
  if (amount < minimum) return res.status(400).json({ message: `Minimum to copy ${trader.name} is $${minimum.toLocaleString("en-US")}`, minimumCopyAmount: minimum });
  if (amount > usdt || usdt < minimum) return res.status(400).json({ message: `You need at least $${minimum.toLocaleString("en-US")} USDT to copy ${trader.name}`, minimumCopyAmount: minimum });
  await User.updateOne({ _id: req.user!._id }, { $addToSet: { copiedTraders: trader._id } });
  await Trader.updateOne({ _id: trader._id }, { $inc: { totalCopiers: 1 } });
  res.json({ message: "Trader copied" });
});
router.post("/:id/uncopy", authenticate, async (req, res) => {
  await User.updateOne({ _id: req.user!._id }, { $pull: { copiedTraders: req.params.id } });
  await Trader.updateOne({ _id: req.params.id, totalCopiers: { $gt: 0 } }, { $inc: { totalCopiers: -1 } });
  res.json({ message: "Trader removed" });
});

function normalize(body: Record<string, string>, image?: { url: string; publicId: string }) {
  return {
    ...body,
    specialties: parseList(body.specialties),
    ...(image ? { profileImage: image.url, profileImagePublicId: image.publicId } : {}),
    experience: Number(body.experience || 1),
    totalTrades: Number(body.totalTrades || 0),
    winRate: Number(body.winRate || 0),
    totalCopiers: Number(body.totalCopiers || 0),
    profitPercentage: { monthly: Number(body["profitPercentage[monthly]"] || 0), yearly: Number(body["profitPercentage[yearly]"] || 0) },
    minimumCopyAmount: Number(body.minimumCopyAmount || 100),
    copierFee: Number(body.copierFee || 0),
  };
}

function parseList(value: unknown): string[] {
  const raw = Array.isArray(value) ? value.join(",") : String(value ?? "");
  return raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8);
}

export default router;
