const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export class SpotifyApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
  }
}

/* ─── Types ─── */

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  images?: SpotifyImage[];
  genres?: string[];
  type: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  uri: string;
  type: string;
  artists?: SpotifyArtist[];
}

export interface SpotifyShow {
  id: string;
  name: string;
  images: SpotifyImage[];
  publisher: string;
  description?: string;
  uri: string;
  type: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  type: string;
  is_playable?: boolean;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  uri: string;
  owner: {
    id: string;
    display_name: string | null;
  };
  items?: {
    total: number;
  };
  tracks?: {
    total: number;
  };
  type: string;
}

export interface SpotifyPaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string | null;
  images: SpotifyImage[];
  uri: string;
  type: string;
}

/* ─── API Helpers ─── */

async function fetchSpotify<T>(
  endpoint: string,
  accessToken: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${SPOTIFY_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value)
    );
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    let errorMsg = res.statusText;
    const rawBody = await res.text();

    if (rawBody) {
      try {
        const parsed = JSON.parse(rawBody) as {
          error?: { message?: string } | string;
          message?: string;
        };

        if (typeof parsed.error === "string") {
          errorMsg = parsed.error;
        } else {
          errorMsg =
            parsed.error?.message ??
            parsed.message ??
            `${res.statusText} - ${rawBody.slice(0, 100)}`;
        }
      } catch {
        errorMsg = `${res.statusText} - ${rawBody.slice(0, 100)}`;
      }
    }

    throw new SpotifyApiError(
      res.status,
      `Spotify API error ${res.status}: ${errorMsg}`
    );
  }

  return res.json() as Promise<T>;
}

export async function getUserProfile(
  accessToken: string
): Promise<SpotifyUserProfile> {
  return fetchSpotify<SpotifyUserProfile>("/me", accessToken);
}

export async function getUserPlaylists(
  accessToken: string,
  limit = 10,
  offset = 0
): Promise<SpotifyPaginatedResponse<SpotifyPlaylist>> {
  return fetchSpotify<SpotifyPaginatedResponse<SpotifyPlaylist>>(
    "/me/playlists",
    accessToken,
    { limit: String(limit), offset: String(offset) }
  );
}

export async function getUserTopTracks(
  accessToken: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = 10
): Promise<SpotifyPaginatedResponse<SpotifyTrack>> {
  return fetchSpotify<SpotifyPaginatedResponse<SpotifyTrack>>(
    "/me/top/tracks",
    accessToken,
    { time_range: timeRange, limit: String(limit) }
  );
}

export async function getUserTopArtists(
  accessToken: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = 10
): Promise<SpotifyPaginatedResponse<SpotifyArtist>> {
  return fetchSpotify<SpotifyPaginatedResponse<SpotifyArtist>>(
    "/me/top/artists",
    accessToken,
    { time_range: timeRange, limit: String(limit) }
  );
}

export async function getUserSavedTracks(
  accessToken: string,
  limit = 10,
  offset = 0
): Promise<SpotifyPaginatedResponse<{ added_at: string; track: SpotifyTrack }>> {
  return fetchSpotify<
    SpotifyPaginatedResponse<{ added_at: string; track: SpotifyTrack }>
  >("/me/tracks", accessToken, {
    limit: String(limit),
    offset: String(offset),
  });
}

export async function getUserAlbums(
  accessToken: string,
  limit = 10,
  offset = 0
): Promise<SpotifyPaginatedResponse<{ added_at: string; album: SpotifyAlbum }>> {
  return fetchSpotify<
    SpotifyPaginatedResponse<{ added_at: string; album: SpotifyAlbum }>
  >("/me/albums", accessToken, {
    limit: String(limit),
    offset: String(offset),
  });
}

export async function searchSpotify(
  accessToken: string,
  query: string,
  types: ("track" | "artist" | "album" | "show")[] = ["track"],
  limit = 10
): Promise<{
  tracks?: SpotifyPaginatedResponse<SpotifyTrack>;
  artists?: SpotifyPaginatedResponse<SpotifyArtist>;
  albums?: SpotifyPaginatedResponse<SpotifyAlbum>;
  shows?: SpotifyPaginatedResponse<SpotifyShow>;
}> {
  return fetchSpotify<{
    tracks?: SpotifyPaginatedResponse<SpotifyTrack>;
    artists?: SpotifyPaginatedResponse<SpotifyArtist>;
    albums?: SpotifyPaginatedResponse<SpotifyAlbum>;
    shows?: SpotifyPaginatedResponse<SpotifyShow>;
  }>("/search", accessToken, {
    q: query,
    type: types.join(","),
    limit: String(Math.min(limit, 10)),
  });
}

export async function getRecommendations(
  accessToken: string,
  seedArtists: string[],
  limit = 10
): Promise<{ tracks: SpotifyTrack[] }> {
  return fetchSpotify<{ tracks: SpotifyTrack[] }>("/recommendations", accessToken, {
    seed_artists: seedArtists.slice(0, 5).join(","),
    limit: String(Math.min(limit, 20)),
  });
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getImageUrl(
  images: SpotifyImage[] | undefined,
  size: "small" | "medium" | "large" = "medium"
): string | null {
  if (!images || images.length === 0) return null;
  if (size === "large") return images[0]?.url ?? null;
  if (size === "small") return images[images.length - 1]?.url ?? null;
  return images[Math.min(1, images.length - 1)]?.url ?? null;
}
