import { auth } from "@/auth";
import { SpotifyApiError } from "@/app/lib/spotify";
import { NextResponse } from "next/server";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  const accessToken =
    session?.access_token ??
    ((session?.user as { access_token?: string } | undefined)?.access_token);

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/player/recently-played?limit=10`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new SpotifyApiError(res.status, `Spotify API error ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof SpotifyApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
