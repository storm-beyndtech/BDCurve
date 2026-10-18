import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

type TokenPayload = { _id: string; role?: string };

export function signToken(user: { _id: unknown; role?: string }) {
  return jwt.sign({ _id: String(user._id), role: user.role }, env.JWT_SECRET, { expiresIn: "7d" });
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    const user = await User.findById(payload._id);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.accountStatus !== "active") return res.status(403).json({ message: "Account is not active" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || (!req.user.isAdmin && req.user.role !== "admin")) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export const adminOnly = [authenticate, requireAdmin] as const;
