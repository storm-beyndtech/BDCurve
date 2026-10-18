import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { LiveTrade } from "../models/Trading.js";

const router = Router();
router.get("/", authenticate, async (_req, res) => res.json(await LiveTrade.find().sort({ openedAt: -1 })));
router.post("/", authenticate, requireAdmin, async (req, res) => res.status(201).json(await LiveTrade.create(req.body)));
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const update = { ...req.body, ...(req.body.status === "closed" ? { closedAt: new Date() } : {}) };
  const trade = await LiveTrade.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!trade) return res.status(404).json({ message: "Live trade not found" });
  res.json(trade);
});
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  const trade = await LiveTrade.findByIdAndDelete(req.params.id);
  if (!trade) return res.status(404).json({ message: "Live trade not found" });
  res.json({ message: "Live trade deleted" });
});
export default router;
