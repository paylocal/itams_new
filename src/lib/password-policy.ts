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
