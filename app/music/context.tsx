"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  useTopTracks,
  usePlaylists,
} from "@/app/lib/hooks";
import type { SpotifyTrack } from "@/app/lib/spotify";

/* ─── Fallback data ─── */

export const FALLBACK_TRACKS = [
  { id: 1, title: "Brutal Sunrise", artist: "Echo Chamber", album: "Concrete Dreams", duration: "3:24", color: "bg-yellow-300", plays: "2.4M" },
  { id: 2, title: "Pixel Heart", artist: "Neon Flux", album: "Digital Love", duration: "4:01", color: "bg-pink-300", plays: "1.8M" },
  { id: 3, title: "Raw Signal", artist: "The Borders", album: "Hard Edges", duration: "2:58", color: "bg-green-300", plays: "1.5M" },
  { id: 4, title: "Shadow Box", artist: "Block Party", album: "4px 4px", duration: "3:47", color: "bg-purple-300", plays: "1.2M" },
  { id: 5, title: "Mono Chrome", artist: "Sans Serif", album: "Type Face", duration: "5:12", color: "bg-orange-300", plays: "980K" },
  { id: 6, title: "Bold Move", artist: "Heavy Weight", album: "700", duration: "3:33", color: "bg-cyan-300", plays: "870K" },
  { id: 7, title: "Grid Collapse", artist: "Flex Box", album: "Layout Wars", duration: "4:15", color: "bg-red-300", plays: "760K" },
  { id: 8, title: "Offset Dream", artist: "Z-Index", album: "Stacking Context", duration: "3:02", color: "bg-amber-300", plays: "650K" },
] as const;

export type FallbackTrack = (typeof FALLBACK_TRACKS)[number];

export const TRACK_COLORS = [
  "bg-yellow-300", "bg-pink-300", "bg-green-300", "bg-purple-300",
  "bg-orange-300", "bg-cyan-300", "bg-red-300", "bg-amber-300",
];

/* ─── Context type ─── */

interface MusicContextValue {
  /* Auth */
  isAuthenticated: boolean;
  sessionStatus: "loading" | "authenticated" | "unauthenticated";
  login: () => void;
  logout: () => void;
  userName: string | null;

  /* Player state */
  isPlaying: boolean;
  currentTrackIndex: number;
  currentTrack: SpotifyTrack | null;
  currentFallbackTrack: FallbackTrack;
  embedUri: string | null;
  likedTracks: Set<string>;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";

  /* Player actions */
  togglePlay: () => void;
  playTrack: (track: SpotifyTrack, index?: number) => void;
  playPlaylist: (uri: string) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleLike: (trackId: string) => void;
  setVolume: (value: number) => void;
  seekTo: (time: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;

  /* Search */
  searchQuery: string;
  activeSearchQuery: string;
  handleSearchInput: (value: string) => void;

  /* Track count for prev/next cycling */
  totalTracks: number;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusicContext(): MusicContextValue {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusicContext must be used within MusicProvider");
  return ctx;
}

/* ─── Provider ─── */

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.access_token;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [embedUri, setEmbedUri] = useState<string | null>(null);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [overrideTrack, setOverrideTrack] = useState<SpotifyTrack | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");

  const { data: topTracks } = useTopTracks("medium_term");
  const { data: playlists } = usePlaylists();

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalTracks = topTracks?.items?.length || FALLBACK_TRACKS.length;
  const currentTrack = overrideTrack ?? topTracks?.items?.[currentTrackIndex] ?? null;
  const currentFallbackTrack = FALLBACK_TRACKS[currentTrackIndex % FALLBACK_TRACKS.length];

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const playTrack = useCallback(
    (track: SpotifyTrack, index?: number) => {
      if (typeof index === "number") setCurrentTrackIndex(index);
      setOverrideTrack(track);
      if (isAuthenticated) setEmbedUri(track.uri);
      setIsPlaying(true);
    },
    [isAuthenticated],
  );

  const playPlaylist = useCallback(
    (uri: string) => {
      if (isAuthenticated) {
        setOverrideTrack(null);
        setEmbedUri(uri);
        setIsPlaying(true);
      }
    },
    [isAuthenticated],
  );

  const nextTrack = useCallback(() => {
    setOverrideTrack(null);
    setCurrentTrackIndex((i) => {
      if (repeatMode === "one") return i;
      if (isShuffle && totalTracks > 1) {
        let next = Math.floor(Math.random() * totalTracks);
        if (next === i) next = (next + 1) % totalTracks;
        return next;
      }
      return (i + 1) % totalTracks;
    });
  }, [isShuffle, repeatMode, totalTracks]);

  const prevTrack = useCallback(() => {
    setOverrideTrack(null);
    setCurrentTrackIndex((i) => {
      if (repeatMode === "one") return i;
      if (isShuffle && totalTracks > 1) {
        let next = Math.floor(Math.random() * totalTracks);
        if (next === i) next = (next + 1) % totalTracks;
        return next;
      }
      return (i - 1 + totalTracks) % totalTracks;
    });
  }, [isShuffle, repeatMode, totalTracks]);

  const toggleLike = useCallback(
    (trackId: string) => {
      setLikedTracks((prev) => {
        const next = new Set(prev);
        if (next.has(trackId)) next.delete(trackId);
        else next.add(trackId);
        return next;
      });

      if (!isAuthenticated) return;
      const isLiked = likedTracks.has(trackId);
      const method = isLiked ? "DELETE" : "PUT";
      void fetch(`/api/spotify/like-track?id=${encodeURIComponent(trackId)}`, {
        method,
      }).catch(() => {
        setLikedTracks((prev) => {
          const next = new Set(prev);
          if (isLiked) next.add(trackId);
          else next.delete(trackId);
          return next;
        });
      });
    },
    [isAuthenticated, likedTracks],
  );

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setActiveSearchQuery(value), 500);
  }, []);

  const login = useCallback(() => signIn("spotify", { callbackUrl: "/music" }), []);
  const logout = useCallback(() => signOut(), []);

  const setVolume = useCallback((value: number) => {
    const safeValue = Math.min(1, Math.max(0, value));
    setVolumeState(safeValue);
    if (audioRef.current) audioRef.current.volume = safeValue;
  }, []);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const previewUrl = currentTrack?.preview_url ?? null;
    if (!previewUrl) {
      audio.pause();
      audio.removeAttribute("src");
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    audio.src = previewUrl;
    audio.load();
    if (isPlaying) {
      void audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrack?.preview_url, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      void audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTime = () => setCurrentTime(audio.currentTime || 0);
    const handleDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        void audio.play();
        return;
      }
      nextTrack();
    };

    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("loadedmetadata", handleDuration);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("loadedmetadata", handleDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [nextTrack, repeatMode]);

  /* suppress unused-var — playlists used by sidebar via separate hook */
  void playlists;

  const value: MusicContextValue = {
    isAuthenticated,
    sessionStatus: status,
    login,
    logout,
    userName: session?.user?.name ?? null,

    isPlaying,
    currentTrackIndex,
    currentTrack,
    currentFallbackTrack,
    embedUri,
    likedTracks,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,

    togglePlay,
    playTrack,
    playPlaylist,
    nextTrack,
    prevTrack,
    toggleLike,
    setVolume,
    seekTo,
    toggleShuffle,
    cycleRepeat,

    searchQuery,
    activeSearchQuery,
    handleSearchInput,

    totalTracks,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </MusicContext.Provider>
  );
};
