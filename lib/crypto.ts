import { randomBytes, createHash } from "crypto";

export function generateSlug(bytes = 12): string {
  return randomBytes(bytes)
    .toString("base64url")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 16);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function expiryToMs(expiry: string): number {
  switch (expiry) {
    case "1h":  return 60 * 60 * 1000;
    case "7d":  return 7 * 24 * 60 * 60 * 1000;
    case "24h":
    default:    return 24 * 60 * 60 * 1000;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatExpiry(dateStr: string): string {
  const date = new Date(dateStr);
  const now  = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs <= 0) return "Expired";
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffH / 24);
  if (diffD > 0) return `${diffD} hari lagi`;
  if (diffH > 0) return `${diffH} jam lagi`;
  const diffM = Math.floor(diffMs / 60000);
  return `${diffM} menit lagi`;
}
