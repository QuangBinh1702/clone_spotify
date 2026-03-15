"use client";

import { useReducer, useEffect, useCallback } from "react";
import type {
  SpotifyTrack,
  SpotifyPlaylist,
  SpotifyArtist,
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
  tracks: SpotifyPaginatedResponse<SpotifyTrack>;
}> {
  const url = query.trim()
    ? `/api/spotify/search?q=${encodeURIComponent(query)}`
    : null;
  return useFetch<{ tracks: SpotifyPaginatedResponse<SpotifyTrack> }>(url);
}
