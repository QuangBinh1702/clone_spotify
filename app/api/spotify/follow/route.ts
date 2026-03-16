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

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing artist id" }, { status: 400 });
  }

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/following?type=artist&ids=${id}`, {
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

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing artist id" }, { status: 400 });
  }

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/following?type=artist&ids=${id}`, {
      method: "DELETE",
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");

  if (!ids) {
    return NextResponse.json({ error: "Missing artist ids" }, { status: 400 });
  }

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/following/contains?type=artist&ids=${ids}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
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
