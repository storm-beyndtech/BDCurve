// Admin / staff accounts live in the User collection (for login) but are not customer profiles.
const reserved = new Set(
  [process.env.ADMIN_SEED_EMAIL, ...(process.env.ADMIN_EMAILS || "").split(",")]
    .map((email) => String(email || "").trim().toLowerCase())
    .filter(Boolean),
);

export const isReservedAdminEmail = (email: string) => reserved.has(String(email || "").trim().toLowerCase());
export const reservedAdminEmails = () => [...reserved];

/** Mongo filter that excludes admin accounts (by role/flag or reserved email). */
export const NON_ADMIN_FILTER = {
  isAdmin: { $ne: true },
  role: { $ne: "admin" },
  ...(reserved.size ? { email: { $nin: [...reserved] } } : {}),
};
