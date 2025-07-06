import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/transactions")) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    const token = request.cookies.get("auth-token")?.value

    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } catch (error) {
        // Token is invalid, allow access to auth pages
        return NextResponse.next()
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/auth/:path*"],
}
