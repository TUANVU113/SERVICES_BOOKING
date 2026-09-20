export interface JwtPayload {
  role?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  email?: string;
  sub?: string;
  fullName?: string;
  [key: string]: unknown;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Lỗi khi parse JWT Token:", e);
    return null;
  }
}

export function extractRoleFromToken(token: string): string {
  const payload = parseJwt(token);
  if (!payload) return "Customer";

  const role =
    payload.role ||
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    (Array.isArray(payload.roles) ? payload.roles[0] : undefined);

  return (role as string) || "Customer";
}
