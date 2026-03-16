import { NextRequest, NextResponse } from "next/server";

/**
 * Public browse endpoint — uses Spotify Client Credentials (no user login needed).
 * Returns new releases, featured playlists and genre categories.
 */

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

/* ─── Client Credentials token (cached in-memory) ─── */

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
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // refresh 60s early
  };

  return cachedToken.token;
}

/* ─── Handler ─── */

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section"); // "new-releases" | "featured" | "categories"
  const country = searchParams.get("country") ?? "US";
  const limit = searchParams.get("limit") ?? "20";

  try {
    const token = await getClientToken();
    const headers = { Authorization: `Bearer ${token}` };

    if (section === "new-releases") {
      const res = await fetch(
        `${SPOTIFY_API_BASE}/browse/new-releases?country=${country}&limit=${limit}`,
        { headers, next: { revalidate: 600 } }
      );
      if (!res.ok) throw new Error(`Spotify ${res.status}`);
      const data = await res.json();
      return NextResponse.json(data.albums);
    }

    if (section === "featured") {
      const res = await fetch(
        `${SPOTIFY_API_BASE}/browse/featured-playlists?country=${country}&limit=${limit}`,
        { headers, next: { revalidate: 600 } }
      );
      if (!res.ok) throw new Error(`Spotify ${res.status}`);
      const data = await res.json();
      return NextResponse.json(data.playlists);
    }

    if (section === "categories") {
      const res = await fetch(
        `${SPOTIFY_API_BASE}/browse/categories?country=${country}&limit=${limit}&locale=en_US`,
        { headers, next: { revalidate: 3600 } }
      );
      if (!res.ok) throw new Error(`Spotify ${res.status}`);
      const data = await res.json();
      return NextResponse.json(data.categories);
    }

    // Default: return all three
    const [releasesRes, featuredRes, categoriesRes] = await Promise.all([
      fetch(
        `${SPOTIFY_API_BASE}/browse/new-releases?country=${country}&limit=10`,
        { headers, next: { revalidate: 600 } }
      ),
      fetch(
        `${SPOTIFY_API_BASE}/browse/featured-playlists?country=${country}&limit=10`,
        { headers, next: { revalidate: 600 } }
      ),
      fetch(
        `${SPOTIFY_API_BASE}/browse/categories?country=${country}&limit=20&locale=en_US`,
        { headers, next: { revalidate: 3600 } }
      ),
    ]);

    const [releasesData, featuredData, categoriesData] = await Promise.all([
      releasesRes.ok ? releasesRes.json() : null,
      featuredRes.ok ? featuredRes.json() : null,
      categoriesRes.ok ? categoriesRes.json() : null,
    ]);

    return NextResponse.json({
      newReleases: releasesData?.albums ?? null,
      featuredPlaylists: featuredData?.playlists ?? null,
      categories: categoriesData?.categories ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
