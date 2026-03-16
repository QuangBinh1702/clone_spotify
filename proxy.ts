import { NextResponse } from "next/server";

export function proxy(): NextResponse {
  // const host = request.headers.get("host");
  // if (host === "localhost:3000") {
  //   const redirectUrl = request.nextUrl.clone();
  //   redirectUrl.hostname = "127.0.0.1";
  //   return NextResponse.redirect(redirectUrl, 307);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
