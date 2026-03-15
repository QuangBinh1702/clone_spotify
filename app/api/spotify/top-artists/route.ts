import { auth } from "@/auth";
import { getUserTopArtists, SpotifyApiError } from "@/app/lib/spotify";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  const accessToken =
    session?.access_token ??
    ((session?.user as { access_token?: string } | undefined)?.access_token);

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getUserTopArtists(accessToken, "medium_term", 10);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof SpotifyApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
