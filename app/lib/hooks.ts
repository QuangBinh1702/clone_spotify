"use client";

import { useReducer, useEffect, useCallback } from "react";
import type {
  SpotifyTrack,
  SpotifyPlaylist,
  SpotifyArtist,
  SpotifyUserProfile,
  SpotifyAlbum,
  SpotifyShow,
  SpotifyPaginatedResponse,
} from "@/app/lib/spotify";

/* ─── Generic fetch hook ─── */

interface UseFetchResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

interface FetchState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

type FetchAction<T> =
  | { type: "start" }
  | { type: "success"; data: T }
  | { type: "error"; error: string }
  | { type: "cancel" };

function fetchReducer<T>(
  state: FetchState<T>,
  action: FetchAction<T>
): FetchState<T> {
  switch (action.type) {
    case "start":
      return { ...state, loading: true, error: null };
    case "success":
      return { data: action.data, error: null, loading: false };
    case "error":
      return { ...state, error: action.error, loading: false };
    case "cancel":
      return { ...state, loading: false };
    default:
      return state;
  }
}

function useFetch<T>(url: string | null): UseFetchResult<T> {
  const [state, dispatch] = useReducer(fetchReducer<T>, {
    data: null,
    error: null,
    loading: false,
  });
  const [trigger, setTrigger] = useReducer((x: number) => x + 1, 0);

  const refetch = useCallback(() => setTrigger(), []);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;
    dispatch({ type: "start" });

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: T) => {
        if (!cancelled) dispatch({ type: "success", data: json });
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: "error", error: err.message });
      });

    return () => {
      cancelled = true;
      dispatch({ type: "cancel" });
    };
  }, [url, trigger]);

  return { data: state.data, error: state.error, loading: state.loading, refetch };
}

/* ─── Spotify hooks ─── */

export function useTopTracks(
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"
): UseFetchResult<SpotifyPaginatedResponse<SpotifyTrack>> {
  return useFetch<SpotifyPaginatedResponse<SpotifyTrack>>(
    `/api/spotify/top-tracks?time_range=${timeRange}`
  );
}

export function useTopArtists(): UseFetchResult<
  SpotifyPaginatedResponse<SpotifyArtist>
> {
  return useFetch<SpotifyPaginatedResponse<SpotifyArtist>>(
    "/api/spotify/top-artists"
  );
}

export function usePlaylists(): UseFetchResult<
  SpotifyPaginatedResponse<SpotifyPlaylist>
> {
  return useFetch<SpotifyPaginatedResponse<SpotifyPlaylist>>(
    "/api/spotify/playlists"
  );
}

export function useSavedTracks(): UseFetchResult<
  SpotifyPaginatedResponse<{ added_at: string; track: SpotifyTrack }>
> {
  return useFetch<
    SpotifyPaginatedResponse<{ added_at: string; track: SpotifyTrack }>
  >("/api/spotify/saved-tracks");
}

export function useSearch(query: string): UseFetchResult<{
  tracks?: SpotifyPaginatedResponse<SpotifyTrack>;
  artists?: SpotifyPaginatedResponse<SpotifyArtist>;
  albums?: SpotifyPaginatedResponse<SpotifyAlbum>;
  shows?: SpotifyPaginatedResponse<SpotifyShow>;
}> {
  const url = query.trim()
    ? `/api/spotify/search?q=${encodeURIComponent(query)}&type=track`
    : null;
  return useFetch<{
    tracks?: SpotifyPaginatedResponse<SpotifyTrack>;
    artists?: SpotifyPaginatedResponse<SpotifyArtist>;
    albums?: SpotifyPaginatedResponse<SpotifyAlbum>;
    shows?: SpotifyPaginatedResponse<SpotifyShow>;
  }>(url);
}

export function useProfile(): UseFetchResult<SpotifyUserProfile> {
  return useFetch<SpotifyUserProfile>("/api/spotify/profile");
}

export interface RecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

export function useRecentlyPlayed(): UseFetchResult<{
  items: RecentlyPlayedItem[];
}> {
  return useFetch<{ items: RecentlyPlayedItem[] }>("/api/spotify/recently-played");
}

export function useAlbums(): UseFetchResult<
  SpotifyPaginatedResponse<{ added_at: string; album: SpotifyAlbum }>
> {
  return useFetch<
    SpotifyPaginatedResponse<{ added_at: string; album: SpotifyAlbum }>
  >("/api/spotify/albums");
}

export function useRecommendations(seedArtists: string[]): UseFetchResult<{
  tracks: SpotifyTrack[];
}> {
  const url = seedArtists.length
    ? `/api/spotify/recommendations?seed_artists=${encodeURIComponent(seedArtists.join(","))}`
    : null;
  return useFetch<{ tracks: SpotifyTrack[] }>(url);
}

export function useSearchTyped(
  query: string,
  type: "track" | "artist" | "album" | "show"
): UseFetchResult<{
  tracks?: SpotifyPaginatedResponse<SpotifyTrack>;
  artists?: SpotifyPaginatedResponse<SpotifyArtist>;
  albums?: SpotifyPaginatedResponse<SpotifyAlbum>;
  shows?: SpotifyPaginatedResponse<SpotifyShow>;
}> {
  const url = query.trim()
    ? `/api/spotify/search?q=${encodeURIComponent(query)}&type=${type}`
    : null;
  return useFetch<{
    tracks?: SpotifyPaginatedResponse<SpotifyTrack>;
    artists?: SpotifyPaginatedResponse<SpotifyArtist>;
    albums?: SpotifyPaginatedResponse<SpotifyAlbum>;
    shows?: SpotifyPaginatedResponse<SpotifyShow>;
  }>(url);
}

/* ─── Browse hooks (public, no login required) ─── */

export interface BrowseData {
  newReleases: SpotifyPaginatedResponse<SpotifyAlbum> | null;
  featuredPlaylists: SpotifyPaginatedResponse<SpotifyPlaylist> | null;
  categories: SpotifyPaginatedResponse<{ id: string; name: string; icons: { url: string }[] }> | null;
}

export function useBrowse(): UseFetchResult<BrowseData> {
  return useFetch<BrowseData>("/api/spotify/browse");
}

export function useBrowseTracks(genre = "pop"): UseFetchResult<SpotifyPaginatedResponse<SpotifyTrack>> {
  return useFetch<SpotifyPaginatedResponse<SpotifyTrack>>(
    `/api/spotify/browse-tracks?genre=${encodeURIComponent(genre)}&limit=20`
  );
}

export function useFeaturedPlaylists(): UseFetchResult<SpotifyPaginatedResponse<SpotifyPlaylist>> {
  return useFetch<SpotifyPaginatedResponse<SpotifyPlaylist>>(
    "/api/spotify/browse?section=featured&limit=10"
  );
}

export function useNewReleases(): UseFetchResult<SpotifyPaginatedResponse<SpotifyAlbum>> {
  return useFetch<SpotifyPaginatedResponse<SpotifyAlbum>>(
    "/api/spotify/browse?section=new-releases&limit=10"
  );
}

export function useBrowseCategories(): UseFetchResult<SpotifyPaginatedResponse<{ id: string; name: string; icons: { url: string }[] }>> {
  return useFetch<SpotifyPaginatedResponse<{ id: string; name: string; icons: { url: string }[] }>>(
    "/api/spotify/browse?section=categories&limit=20"
  );
}
