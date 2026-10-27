import { NextResponse } from "next/server";

/**
 * Applies baseline security headers to page responses.
 *
 * This is not an auth gate: the demo session lives in sessionStorage, which
 * the proxy cannot read. Route access stays in RoleGuard on the client.
 */
export function proxy() {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|byd-frames/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|mp4|webm|woff2?|ttf|otf)$).*)",
  ],
};
