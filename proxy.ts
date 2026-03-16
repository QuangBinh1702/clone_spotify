import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const accessToken =
    session?.access_token ??
    ((session?.user as { access_token?: string } | undefined)?.access_token);

  if (!accessToken) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/music/:path*"],
};
