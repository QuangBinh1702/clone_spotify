import { auth } from "@/auth";
import { getRecommendations, SpotifyApiError } from "@/app/lib/spotify";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  const accessToken =
    session?.access_token ??
    ((session?.user as { access_token?: string } | undefined)?.access_token);

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const seeds = searchParams.get("seed_artists");
  const seedArtists = seeds ? seeds.split(",").map((s) => s.trim()).filter(Boolean) : [];

  if (seedArtists.length === 0) {
    return NextResponse.json({ error: "seed_artists is required" }, { status: 400 });
  }

  try {
    const data = await getRecommendations(accessToken, seedArtists, 8);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof SpotifyApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
