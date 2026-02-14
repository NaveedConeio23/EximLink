import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecretkey"
);

// =====================================
// 🔐 GENERATE TOKEN
// =====================================
export async function generateToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// =====================================
// 🔎 VERIFY TOKEN
// =====================================
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// =====================================
// 👤 GET CURRENT USER (NEXT 15 SAFE)
// =====================================
export async function getCurrentUser() {
  const cookieStore = await cookies(); // MUST await in Next 15
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  return await verifyToken(token);
}

// =====================================
// 🔑 COMPARE PASSWORD
// =====================================
export async function comparePassword(
  plain: string,
  hash: string
) {
  return bcrypt.compare(plain, hash);
}
