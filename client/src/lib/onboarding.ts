import type { User } from "@/lib/banking/types";

export function isOnboardingComplete(user: User | null | undefined) {
  if (!user) return false;
  return user.onboardingCompleted === true;
}
