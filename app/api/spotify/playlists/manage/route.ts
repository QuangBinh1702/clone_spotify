import { auth } from "@/auth";
import { SpotifyApiError } from "@/app/lib/spotify";
import { NextRequest, NextResponse } from "next/server";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

async function resolveAccessToken() {
  const session = await auth();
  return (
    session?.access_token ??
    ((session?.user as { access_token?: string } | undefined)?.access_token)
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user_id, name, description, public: isPublic } = await request.json();

  if (!user_id || !name) {
    return NextResponse.json({ error: "Missing user_id or name" }, { status: 400 });
  }

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/users/${user_id}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description, public: isPublic }),
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

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { playlist_id, name, description, public: isPublic } = await request.json();

  if (!playlist_id) {
    return NextResponse.json({ error: "Missing playlist_id" }, { status: 400 });
  }

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlist_id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description, public: isPublic }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new SpotifyApiError(res.status, `Spotify API error ${res.status}: ${body.slice(0, 200)}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof SpotifyApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
