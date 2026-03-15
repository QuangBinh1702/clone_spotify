import { auth } from "@/auth";
import { searchTracks, SpotifyApiError } from "@/app/lib/spotify";
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
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const data = await searchTracks(accessToken, query, 10);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof SpotifyApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
