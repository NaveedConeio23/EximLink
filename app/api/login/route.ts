import { NextResponse } from "next/server";
import { generateToken, comparePassword } from "@/lib/auth";

export async function POST(req: Request) {
  console.log("ENV CHECK:");
  console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
  console.log("ADMIN_PASSWORD_HASH:", process.env.ADMIN_PASSWORD_HASH);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  try {
    const { email, password } = await req.json();

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const valid = await comparePassword(password, ADMIN_PASSWORD_HASH);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const user = {
      id: "1",
      firstName: "Coneio",
      lastName: "Exim",
      email,
    };

    const token = await generateToken(user);

    const response = NextResponse.json({ success: true });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
