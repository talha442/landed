import { NextResponse, type NextRequest } from "next/server";

// First visit: remember the visitor's country (Vercel's geo header) so prices open in
// their currency with their shipping and import charges. The ship-to picker overrides it.
export function proxy(request: NextRequest) {
  const res = NextResponse.next();
  if (!request.cookies.has("geo")) {
    const country = request.headers.get("x-vercel-ip-country");
    if (country) res.cookies.set("geo", country, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/|img/|favicon.ico).*)"],
};
