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

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.text();
    const res = await fetch(`${SPOTIFY_API_BASE}/me/player/play`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      ...(body ? { body } : {}),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new SpotifyApiError(res.status, `Spotify API error ${res.status}: ${text.slice(0, 200)}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof SpotifyApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(): Promise<NextResponse> {
  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/player/pause`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action !== "next" && action !== "previous") {
    return NextResponse.json({ error: "Invalid action, must be 'next' or 'previous'" }, { status: 400 });
  }

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/player/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
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

export async function GET(): Promise<NextResponse> {
  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 204) {
      return NextResponse.json(null);
    }

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
