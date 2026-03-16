import { NextRequest, NextResponse } from "next/server";

/**
 * Public trending tracks — uses Client Credentials to search popular tracks.
 * No user login needed. Returns tracks from Spotify search for popular/trending music.
 */

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getClientToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.AUTH_SPOTIFY_ID;
  const clientSecret = process.env.AUTH_SPOTIFY_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify client credentials");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get client token: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre") ?? "pop";
  const limit = searchParams.get("limit") ?? "20";
  const market = searchParams.get("market") ?? "US";

  try {
    const token = await getClientToken();

    // Search for popular tracks with genre filter + year for trending feel
    const currentYear = new Date().getFullYear();
    const query = `genre:${genre} year:${currentYear - 1}-${currentYear}`;

    const res = await fetch(
      `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&market=${market}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 600 },
      }
    );

    if (!res.ok) {
      throw new Error(`Spotify ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data.tracks);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
