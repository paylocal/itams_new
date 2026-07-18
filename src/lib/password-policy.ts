import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
  passwordExpiryDays: number;
  preventReuseCount: number;
  lockoutAfterFailedAttempts: number | null;
}

export async function getActivePasswordPolicy(): Promise<PasswordPolicy> {
  const policy = await prisma.passwordPolicy.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });
  return {
    minLength: policy?.minLength ?? 8,
    requireUppercase: policy?.requireUppercase ?? true,
    requireLowercase: policy?.requireLowercase ?? true,
    requireNumber: policy?.requireNumber ?? true,
    requireSpecial: policy?.requireSpecial ?? true,
    passwordExpiryDays: policy?.passwordExpiryDays ?? 90,
    preventReuseCount: policy?.preventReuseCount ?? 3,
    lockoutAfterFailedAttempts: policy?.lockoutAfterFailedAttempts ?? 5,
  };
}

export function validatePasswordStrength(
  password: string,
  policy: PasswordPolicy
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < policy.minLength) {
    errors.push(`Mat khau it nhat ${policy.minLength} ky tu`);
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Can it nhat 1 chu hoa");
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Can it nhat 1 chu thuong");
  }
  if (policy.requireNumber && !/\d/.test(password)) {
    errors.push("Can it nhat 1 chu so");
  }
  if (policy.requireSpecial && !/[!@#$%^*&*(),.?":{}|<>_\[\]\\/\-+=]/.test(password)) {
    errors.push("Can it nhat 1 ky tu dac biet");
  }
  return { valid: errors.length === 0, errors };
}

export function generatePassword(policy: PasswordPolicy): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*(),.?\":{}|<>_[]\\/-+=";

  let chars = "";
  let password = "";

  if (policy.requireUppercase) {
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    chars += uppercase;
  }
  if (policy.requireLowercase) {
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    chars += lowercase;
  }
  if (policy.requireNumber) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
    chars += numbers;
  }
  if (policy.requireSpecial) {
    password += special[Math.floor(Math.random() * special.length)];
    chars += special;
  }

  const minLength = Math.max(policy.minLength, 12);
  while (password.length < minLength || password.length < 12) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export async function isPasswordReused(
  userId: string,
  newPassword: string,
  policy: PasswordPolicy
): Promise<boolean> {
  if (!policy.preventReuseCount || policy.preventReuseCount <= 0) return false;
  const recentHistory = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: policy.preventReuseCount,
  });
  for (const h of recentHistory) {
    if (await bcrypt.compare(newPassword, h.passwordHash)) {
      return true;
    }
  }
  return false;
}

export async function recordPasswordChange(userId: string, passwordHash: string) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash, lastPasswordChangeAt: new Date() },
    }),
    prisma.passwordHistory.create({
      data: { userId, passwordHash },
    }),
  ]);
}

export function isPasswordExpired(
  lastPasswordChangeAt: Date,
  policy: PasswordPolicy
): boolean {
  if (!policy.passwordExpiryDays || policy.passwordExpiryDays <= 0) return false;
  const expiry = new Date(lastPasswordChangeAt);
  expiry.setDate(expiry.getDate() + policy.passwordExpiryDays);
  return new Date() > expiry;
}
