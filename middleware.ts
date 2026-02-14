// import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "./lib/auth";

// export async function middleware(req: NextRequest) {
//   const token = req.cookies.get("auth_token")?.value;

//   const protectedRoutes = ["/dashboard"];

//   if (
//     protectedRoutes.some((route) =>
//       req.nextUrl.pathname.startsWith(route)
//     )
//   ) {
//     if (!token) {
//       return NextResponse.redirect(
//         new URL("/login", req.url)
//       );
//     }

//     const valid = await verifyToken(token);

//     if (!valid) {
//       return NextResponse.redirect(
//         new URL("/login", req.url)
//       );
//     }
//   }

//   return NextResponse.next();
// }




// import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/lib/auth";

// export async function middleware(req: NextRequest) {
//   const token = req.cookies.get("auth_token")?.value;

//   const protectedRoutes = ["/dashboard"];

//   const isProtected = protectedRoutes.some((route) =>
//     req.nextUrl.pathname.startsWith(route)
//   );

//   if (isProtected) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     const valid = verifyToken(token);

//     if (!valid) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }
//   }

//   return NextResponse.next();
// }




import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const protectedRoutes = ["/dashboard"];

  if (
    protectedRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    )
  ) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/login", req.url)
      );
    }

    const valid = await verifyToken(token);

    if (!valid) {
      return NextResponse.redirect(
        new URL("/login", req.url)
      );
    }
  }

  return NextResponse.next();
}
