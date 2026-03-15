import { auth } from "@/auth";
import { getUserTopTracks, SpotifyApiError } from "@/app/lib/spotify";
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
  const timeRange = (searchParams.get("time_range") ?? "medium_term") as
    | "short_term"
    | "medium_term"
    | "long_term";

  try {
    const data = await getUserTopTracks(accessToken, timeRange, 10);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof SpotifyApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
