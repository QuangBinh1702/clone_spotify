"use client";

import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import ThemeToggle from "@/app/components/theme-toggle";
import {
  useTopTracks,
  useTopArtists,
  usePlaylists,
  useSavedTracks,
  useSearch,
} from "@/app/lib/hooks";
import {
  formatDuration,
  getImageUrl,
  type SpotifyTrack,
  type SpotifyPlaylist,
  type SpotifyArtist,
} from "@/app/lib/spotify";

const CURRENT_YEAR = new Date().getFullYear();

/* ────────────────────────────────────────────────────────── */
/*  Fallback Data (when not connected to Spotify)            */
/* ────────────────────────────────────────────────────────── */

const FALLBACK_TRACKS: {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  color: string;
  plays: string;
}[] = [
  { id: 1, title: "Brutal Sunrise", artist: "Echo Chamber", album: "Concrete Dreams", duration: "3:24", color: "bg-yellow-300", plays: "2.4M" },
  { id: 2, title: "Pixel Heart", artist: "Neon Flux", album: "Digital Love", duration: "4:01", color: "bg-pink-300", plays: "1.8M" },
  { id: 3, title: "Raw Signal", artist: "The Borders", album: "Hard Edges", duration: "2:58", color: "bg-green-300", plays: "1.5M" },
  { id: 4, title: "Shadow Box", artist: "Block Party", album: "4px 4px", duration: "3:47", color: "bg-purple-300", plays: "1.2M" },
  { id: 5, title: "Mono Chrome", artist: "Sans Serif", album: "Type Face", duration: "5:12", color: "bg-orange-300", plays: "980K" },
  { id: 6, title: "Bold Move", artist: "Heavy Weight", album: "700", duration: "3:33", color: "bg-cyan-300", plays: "870K" },
  { id: 7, title: "Grid Collapse", artist: "Flex Box", album: "Layout Wars", duration: "4:15", color: "bg-red-300", plays: "760K" },
  { id: 8, title: "Offset Dream", artist: "Z-Index", album: "Stacking Context", duration: "3:02", color: "bg-amber-300", plays: "650K" },
];

const FALLBACK_PLAYLISTS: {
  id: number;
  name: string;
  tracks: number;
  color: string;
  accent: string;
}[] = [
  { id: 1, name: "Chill Brutalism", tracks: 28, color: "bg-green-300", accent: "bg-green-400" },
  { id: 2, name: "Late Night Code", tracks: 64, color: "bg-purple-300", accent: "bg-purple-400" },
  { id: 3, name: "Workout Raw", tracks: 35, color: "bg-red-300", accent: "bg-red-400" },
  { id: 4, name: "Focus Mode", tracks: 51, color: "bg-cyan-300", accent: "bg-cyan-400" },
  { id: 5, name: "Retro Waves", tracks: 42, color: "bg-yellow-300", accent: "bg-yellow-400" },
  { id: 6, name: "Indie Bold", tracks: 37, color: "bg-pink-300", accent: "bg-pink-400" },
];

const FALLBACK_ARTISTS: {
  name: string;
  listeners: string;
  color: string;
  initial: string;
}[] = [
  { name: "Echo Chamber", listeners: "2.1M", color: "bg-yellow-300", initial: "EC" },
  { name: "Neon Flux", listeners: "1.8M", color: "bg-pink-300", initial: "NF" },
  { name: "The Borders", listeners: "1.5M", color: "bg-green-300", initial: "TB" },
  { name: "Block Party", listeners: "1.2M", color: "bg-purple-300", initial: "BP" },
  { name: "Sans Serif", listeners: "980K", color: "bg-orange-300", initial: "SS" },
  { name: "Heavy Weight", listeners: "870K", color: "bg-cyan-300", initial: "HW" },
];

const GENRES = [
  { name: "Electronic", color: "bg-cyan-300", size: "col-span-2 row-span-2" },
  { name: "Hip Hop", color: "bg-yellow-300", size: "col-span-1 row-span-1" },
  { name: "Indie Rock", color: "bg-pink-300", size: "col-span-1 row-span-2" },
  { name: "Lo-Fi", color: "bg-green-300", size: "col-span-1 row-span-1" },
  { name: "Jazz", color: "bg-orange-300", size: "col-span-2 row-span-1" },
  { name: "Pop", color: "bg-purple-300", size: "col-span-1 row-span-1" },
  { name: "R&B", color: "bg-red-300", size: "col-span-1 row-span-1" },
  { name: "Classical", color: "bg-amber-200", size: "col-span-1 row-span-1" },
] as const;

const QUICK_PICKS = [
  { title: "Daily Mix 1", subtitle: "Echo Chamber, Neon Flux and more", color: "bg-yellow-300" },
  { title: "Daily Mix 2", subtitle: "The Borders, Block Party and more", color: "bg-green-300" },
  { title: "Release Radar", subtitle: "Catch all the latest music", color: "bg-pink-300" },
  { title: "Discover Weekly", subtitle: "Your personal mixtape", color: "bg-purple-300" },
  { title: "Liked Songs", subtitle: "248 songs", color: "bg-cyan-300" },
  { title: "On Repeat", subtitle: "Songs you can't stop playing", color: "bg-orange-300" },
] as const;

const TRACK_COLORS = [
  "bg-yellow-300", "bg-pink-300", "bg-green-300", "bg-purple-300",
  "bg-orange-300", "bg-cyan-300", "bg-red-300", "bg-amber-300",
];

/* ────────────────────────────────────────────────────────── */
/*  Icons                                                    */
/* ────────────────────────────────────────────────────────── */

const PlayIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="6,3 20,12 6,21" />
  </svg>
);

const PauseIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <rect x="5" y="3" width="5" height="18" />
    <rect x="14" y="3" width="5" height="18" />
  </svg>
);

const SkipForwardIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="5,3 15,12 5,21" />
    <rect x="17" y="3" width="3" height="18" />
  </svg>
);

const SkipBackIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="19,3 9,12 19,21" />
    <rect x="4" y="3" width="3" height="18" />
  </svg>
);

const ShuffleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
    <path d="m18 2 4 4-4 4" />
    <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
    <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
    <path d="m18 14 4 4-4 4" />
  </svg>
);

const RepeatIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

const HeartIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const VolumeIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const SearchIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const HomeIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const LibraryIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 6 4 14" />
    <path d="M12 6v14" />
    <path d="M8 8v12" />
    <path d="M4 4v16" />
  </svg>
);

const MusicNoteIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const MenuIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const MicIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const RadioIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
  </svg>
);

const ListIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" x2="21" y1="6" y2="6" />
    <line x1="8" x2="21" y1="12" y2="12" />
    <line x1="8" x2="21" y1="18" y2="18" />
    <line x1="3" x2="3.01" y1="6" y2="6" />
    <line x1="3" x2="3.01" y1="12" y2="12" />
    <line x1="3" x2="3.01" y1="18" y2="18" />
  </svg>
);

const SpotifyLogo: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

/* ────────────────────────────────────────────────────────── */
/*  Page                                                     */
/* ────────────────────────────────────────────────────────── */

const MusicPage: React.FC = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.access_token;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<"short_term" | "medium_term" | "long_term">("medium_term");
  const [embedUri, setEmbedUri] = useState<string | null>(null);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  const { data: topTracks, loading: topTracksLoading } = useTopTracks(timeRange);
  const { data: topArtists, loading: topArtistsLoading } = useTopArtists();
  const { data: playlists, loading: playlistsLoading } = usePlaylists();
  const { data: savedTracks } = useSavedTracks();
  const { data: searchResults, loading: searchLoading } = useSearch(activeSearchQuery);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setActiveSearchQuery(value);
    }, 500);
  }, []);

  const toggleLike = useCallback((trackId: string) => {
    setLikedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  }, []);

  const handlePlayTrack = useCallback(
    (uri: string, index: number) => {
      setCurrentTrackIndex(index);
      if (isAuthenticated) {
        setEmbedUri(uri);
      }
      setIsPlaying(true);
    },
    [isAuthenticated]
  );

  const handlePlayPlaylist = useCallback(
    (uri: string) => {
      if (isAuthenticated) {
        setEmbedUri(uri);
        setIsPlaying(true);
      }
    },
    [isAuthenticated]
  );

  const currentDisplayTrack = topTracks?.items?.[currentTrackIndex] ?? null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans text-foreground">
      {/* Top bar */}
      <TopBar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isAuthenticated={isAuthenticated}
        searchQuery={searchQuery}
        onSearchChange={handleSearchInput}
      />

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          isAuthenticated={isAuthenticated}
          playlists={playlists?.items ?? null}
          playlistsLoading={playlistsLoading}
          onPlayPlaylist={handlePlayPlaylist}
        />

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          {/* Search results overlay */}
          {activeSearchQuery && isAuthenticated && (
            <SearchResults
              query={activeSearchQuery}
              results={searchResults}
              loading={searchLoading}
              onPlay={handlePlayTrack}
              likedTracks={likedTracks}
              onToggleLike={toggleLike}
            />
          )}

          {!activeSearchQuery && (
            <>
              <HeroSection isPlaying={isPlaying} onToggle={() => setIsPlaying(!isPlaying)} isAuthenticated={isAuthenticated} />
              <QuickPicks isAuthenticated={isAuthenticated} savedTracks={savedTracks?.items ?? null} />

              {/* Spotify Embed Player */}
              {embedUri && (
                <section className="border-b-[2px] border-border-muted bg-background">
                  <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
                    <div className="mb-3">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-main">Now Playing</span>
                      <h2 className="text-xl font-bold tracking-tight">Spotify Player</h2>
                    </div>
                    <div className="overflow-hidden rounded-[5px] border-[2px] border-border shadow-brutal">
                      <iframe
                        src={`https://open.spotify.com/embed/${embedUri.replace("spotify:", "").replace(/:/g, "/")}?utm_source=generator&theme=0`}
                        width="100%"
                        height="152"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="border-0"
                        title="Spotify Player"
                      />
                    </div>
                  </div>
                </section>
              )}

              <TrendingSection
                isAuthenticated={isAuthenticated}
                spotifyTracks={topTracks?.items ?? null}
                loading={topTracksLoading}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onPlay={handlePlayTrack}
                likedTracks={likedTracks}
                onToggleLike={toggleLike}
              />

              <GenreMosaic />

              <PlaylistsSection
                isAuthenticated={isAuthenticated}
                spotifyPlaylists={playlists?.items ?? null}
                loading={playlistsLoading}
                onPlayPlaylist={handlePlayPlaylist}
              />

              <ArtistsSection
                isAuthenticated={isAuthenticated}
                spotifyArtists={topArtists?.items ?? null}
                loading={topArtistsLoading}
              />

              <FooterSection />
            </>
          )}
        </main>
      </div>

      {/* Player bar */}
      <PlayerBar
        isPlaying={isPlaying}
        onToggle={() => setIsPlaying(!isPlaying)}
        isAuthenticated={isAuthenticated}
        spotifyTrack={currentDisplayTrack}
        fallbackTrack={FALLBACK_TRACKS[currentTrackIndex] ?? FALLBACK_TRACKS[0]}
        onNext={() => setCurrentTrackIndex((i) => (i + 1) % (topTracks?.items?.length || FALLBACK_TRACKS.length))}
        onPrev={() => setCurrentTrackIndex((i) => (i - 1 + (topTracks?.items?.length || FALLBACK_TRACKS.length)) % (topTracks?.items?.length || FALLBACK_TRACKS.length))}
      />
    </div>
  );
};

export default MusicPage;

/* ────────────────────────────────────────────────────────── */
/*  Loading Skeleton                                         */
/* ────────────────────────────────────────────────────────── */

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-[5px] bg-border-muted ${className}`} />
);

/* ────────────────────────────────────────────────────────── */
/*  Top Bar                                                  */
/* ────────────────────────────────────────────────────────── */

interface TopBarProps {
  onMenuToggle: () => void;
  isAuthenticated: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle, isAuthenticated, searchQuery, onSearchChange }) => {
  const { data: session } = useSession();

  return (
    <header className="z-50 flex shrink-0 items-center justify-between border-b-[2px] border-border-muted bg-background px-4 py-2.5 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="cursor-pointer rounded-[5px] border-[2px] border-border-muted p-1.5 text-foreground transition-colors hover:border-foreground hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-main md:hidden"
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>
        <a href="/music" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[5px] border-[2px] border-black bg-main shadow-brutal-sm">
            <MusicNoteIcon size={18} />
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground">
            neo<span className="text-main">beats</span>
          </span>
        </a>
      </div>

      {/* Search */}
      <div className="hidden max-w-lg flex-1 px-10 md:block">
        <div className="flex items-center gap-2.5 rounded-[5px] border-[2px] border-border-muted bg-surface-hover px-4 py-2 backdrop-blur-sm transition-all focus-within:border-main focus-within:bg-surface-hover">
          <SearchIcon />
          <input
            type="text"
            placeholder={isAuthenticated ? "Search Spotify tracks..." : "What do you want to listen to?"}
            className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-fg-subtle"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => onSearchChange("")} className="cursor-pointer text-fg-subtle hover:text-foreground" aria-label="Clear search">
              <CloseIcon />
            </button>
          )}
          <span className="hidden rounded-[3px] border border-border-muted px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle lg:block">/</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        {!isAuthenticated ? (
          <button
              onClick={() => signIn("spotify", { callbackUrl: "/music" })}
            className="btn-brutal flex cursor-pointer items-center gap-2 border-[#1DB954] bg-[#1DB954] px-5 py-2 text-xs font-bold uppercase tracking-wider text-black"
          >
            <SpotifyLogo />
            <span className="hidden md:inline">Connect Spotify</span>
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className="btn-brutal hidden cursor-pointer border-border-muted bg-surface-hover px-4 py-2 text-xs font-bold text-fg-muted md:block"
          >
            Disconnect
          </button>
        )}
        <ThemeToggle />
        <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[5px] border-[2px] border-border-muted bg-surface-hover text-xs font-bold text-foreground transition-colors hover:border-fg-muted">
          {session?.user?.name?.slice(0, 2).toUpperCase() ?? "NB"}
        </div>
      </div>
    </header>
  );
};

/* ────────────────────────────────────────────────────────── */
/*  Sidebar                                                  */
/* ────────────────────────────────────────────────────────── */

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeNav: string;
  onNavChange: (nav: string) => void;
  isAuthenticated: boolean;
  playlists: SpotifyPlaylist[] | null;
  playlistsLoading: boolean;
  onPlayPlaylist: (uri: string) => void;
}

const SIDEBAR_NAV = [
  { icon: <HomeIcon />, label: "Home" },
  { icon: <SearchIcon />, label: "Search" },
  { icon: <LibraryIcon />, label: "Library" },
  { icon: <RadioIcon />, label: "Radio" },
];

const Sidebar: React.FC<SidebarProps> = ({
  isOpen, onClose, activeNav, onNavChange,
  isAuthenticated, playlists, playlistsLoading, onPlayPlaylist,
}) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={onClose} aria-hidden="true" />
    )}

    <aside
      className={`
        fixed left-0 top-[52px] z-40 flex h-[calc(100vh-52px)] w-[280px] flex-col border-r-[2px] border-border-muted bg-background
        transition-transform duration-300 ease-out md:static md:h-auto md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 cursor-pointer rounded-[5px] border-[2px] border-border-muted p-1 text-foreground hover:bg-surface-hover md:hidden"
        aria-label="Close sidebar"
      >
        <CloseIcon />
      </button>

      <nav className="space-y-0.5 p-3 pt-4 md:pt-3">
        {SIDEBAR_NAV.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavChange(item.label)}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-[5px] px-3 py-2.5 text-sm font-bold transition-all ${
              activeNav === item.label
                ? "border-[2px] border-black bg-main text-black shadow-brutal-sm"
                : "border-[2px] border-transparent text-fg-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mx-3 my-2 h-[2px] bg-border-muted" />

      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-fg-subtle">
          {isAuthenticated ? "Your Playlists" : "Playlists"}
        </h3>
        <button className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] text-lg font-bold text-fg-subtle transition-colors hover:bg-surface-hover hover:text-foreground">
          +
        </button>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {playlistsLoading && isAuthenticated ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="h-9 w-9 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          ))
        ) : isAuthenticated && playlists && playlists.length > 0 ? (
          playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => handlePlaylistClick(pl, onPlayPlaylist)}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-[5px] px-3 py-2 text-left transition-all hover:bg-surface-hover"
            >
              {pl.images?.[0]?.url ? (
                <Image
                  src={pl.images[0].url}
                  alt={pl.name}
                  className="h-9 w-9 shrink-0 rounded-[4px] border-[2px] border-black object-cover shadow-brutal-sm"
                  width={36}
                  height={36}
                />
              ) : (
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border-[2px] border-black ${TRACK_COLORS[Number(pl.id.charCodeAt(0)) % TRACK_COLORS.length]} shadow-brutal-sm`}>
                  <MusicNoteIcon size={14} />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{pl.name}</p>
                <p className="text-[10px] font-medium text-fg-subtle">
                  {(pl.items?.total ?? pl.tracks?.total ?? 0)} tracks
                </p>
              </div>
            </button>
          ))
        ) : (
          FALLBACK_PLAYLISTS.map((pl) => (
            <a
              key={pl.id}
              href="#"
              className="group flex cursor-pointer items-center gap-3 rounded-[5px] px-3 py-2 transition-all hover:bg-surface-hover"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border-[2px] border-black ${pl.color} shadow-brutal-sm`}>
                <MusicNoteIcon size={14} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground group-hover:text-foreground">{pl.name}</p>
                <p className="text-[10px] font-medium text-fg-subtle">{pl.tracks} tracks</p>
              </div>
            </a>
          ))
        )}
      </div>
    </aside>
  </>
);

function handlePlaylistClick(pl: SpotifyPlaylist, onPlay: (uri: string) => void): void {
  onPlay(pl.uri);
}

/* ────────────────────────────────────────────────────────── */
/*  Hero                                                     */
/* ────────────────────────────────────────────────────────── */

const HeroSection: React.FC<{
  isPlaying: boolean;
  onToggle: () => void;
  isAuthenticated: boolean;
}> = ({ isPlaying, onToggle, isAuthenticated }) => (
  <section className="relative overflow-hidden border-b-[2px] border-border-muted">
    <div className="absolute inset-0 bg-gradient-to-b from-main/20 via-background to-background" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

    <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-end md:gap-12">
        <div className="group relative shrink-0">
          <div className="relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-[5px] border-[2px] border-black bg-main shadow-brutal-lg transition-shadow md:h-72 md:w-72">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-44 w-44 rounded-full border-[2px] border-black/20 md:h-56 md:w-56" />
              <div className="absolute h-32 w-32 rounded-full border-[2px] border-black/15 md:h-40 md:w-40" />
              <div className="absolute h-20 w-20 rounded-full border-[2px] border-black/20 bg-black/10 md:h-24 md:w-24" />
              <div className="absolute h-6 w-6 rounded-full bg-black/40" />
            </div>
            <div className={`absolute inset-0 flex items-center justify-center ${isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`}>
              <MusicNoteIcon size={48} />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 -z-10 h-full w-full rounded-[5px] bg-main/30" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-[5px] border-[2px] border-black bg-yellow-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-black shadow-brutal-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
            </span>
            {isAuthenticated ? "Your Library" : "Featured Playlist"}
          </span>

          <h1 className="mb-2 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Neo Beats<br />
            <span className="text-main">Weekly</span>
          </h1>

          <p className="mb-6 max-w-md text-sm font-medium leading-relaxed text-fg-subtle md:text-base">
            {isAuthenticated
              ? "Your personalized music experience powered by Spotify. Browse your playlists, discover top tracks, and enjoy your library."
              : "Your weekly mixtape of fresh neobrutalist bangers. Connect Spotify to see your real data."}
          </p>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-6 text-xs font-bold uppercase tracking-wider text-fg-subtle md:justify-start">
            <span>42 tracks</span>
            <span className="h-3 w-px bg-border-muted" />
            <span>2hr 38min</span>
            <span className="h-3 w-px bg-border-muted" />
            <span>12.4K saves</span>
          </div>

          <div className="flex items-center justify-center gap-3 md:justify-start">
            <button
              onClick={onToggle}
              className="btn-brutal flex cursor-pointer items-center gap-2.5 border-black bg-main px-8 py-3 text-sm font-bold uppercase tracking-wider text-black"
            >
              {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
              {isPlaying ? "Pause" : "Play All"}
            </button>
            <button className="btn-brutal flex cursor-pointer items-center gap-2 border-border-muted bg-surface-hover px-5 py-3 text-sm font-bold text-foreground backdrop-blur-sm">
              <ShuffleIcon />
              Shuffle
            </button>
            <button className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[5px] border-[2px] border-border-muted text-fg-muted transition-colors hover:border-pink-400 hover:text-pink-400" aria-label="Like playlist">
              <HeartIcon />
            </button>
          </div>

          {!isAuthenticated && (
            <div className="mt-6 flex items-center justify-center gap-2 md:justify-start">
              <button
              onClick={() => signIn("spotify", { callbackUrl: "/music" })}
                className="btn-brutal flex cursor-pointer items-center gap-2 border-[#1DB954] bg-[#1DB954] px-6 py-2.5 text-xs font-bold text-black"
              >
                <SpotifyLogo />
                Connect Spotify for personalized data
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex items-end justify-center gap-[3px] md:justify-start">
        {Array.from({ length: 32 }).map((_, i) => {
          const seed = (i * 12.9898) % 1;
          const fakeRandom1 = Math.sin(seed) * 0.5 + 0.5;
          const fakeRandom2 = Math.sin(seed * 43758.5453) % 1;
          return (
            <div
              key={i}
              className={`w-[3px] rounded-full bg-main ${isPlaying ? "animate-pulse" : ""}`}
              style={{
                height: `${Math.max(4, Math.sin(i * 0.5) * 20 + fakeRandom1 * 16)}px`,
                opacity: isPlaying ? 0.6 + fakeRandom2 * 0.4 : 0.15,
                animationDelay: `${i * 50}ms`,
                animationDuration: `${600 + fakeRandom2 * 400}ms`,
              }}
            />
          );
        })}
      </div>
    </div>
  </section>
);

/* ────────────────────────────────────────────────────────── */
/*  Quick Picks                                              */
/* ────────────────────────────────────────────────────────── */

const QuickPicks: React.FC<{
  isAuthenticated: boolean;
  savedTracks: { added_at: string; track: SpotifyTrack }[] | null;
}> = ({ isAuthenticated, savedTracks }) => {
  const picks = isAuthenticated && savedTracks && savedTracks.length > 0
    ? savedTracks.slice(0, 6).map((item) => ({
        title: item.track.name,
        subtitle: item.track.artists.map((a) => a.name).join(", "),
        color: TRACK_COLORS[item.track.name.charCodeAt(0) % TRACK_COLORS.length],
        image: getImageUrl(item.track.album.images, "small"),
      }))
    : QUICK_PICKS.map((p) => ({ ...p, image: null as string | null }));

  return (
    <section className="border-b-[2px] border-border-muted bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((pick) => (
            <button
              key={pick.title}
              className="group flex cursor-pointer items-center gap-3 overflow-hidden rounded-[5px] border-[2px] border-border-muted bg-surface-hover transition-all hover:border-border hover:bg-surface-hover"
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center ${pick.color}`}>
                {pick.image ? (
                  <Image src={pick.image} alt={pick.title} className="h-full w-full object-cover" width={56} height={56} />
                ) : (
                  <MusicNoteIcon size={18} />
                )}
              </div>
              <div className="min-w-0 flex-1 pr-3 text-left">
                <p className="truncate text-sm font-bold text-foreground">{pick.title}</p>
                <p className="truncate text-[11px] font-medium text-fg-subtle">{pick.subtitle}</p>
              </div>
              <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-main text-black opacity-0 shadow-lg transition-all group-hover:opacity-100">
                <PlayIcon size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ────────────────────────────────────────────────────────── */
/*  Search Results                                           */
/* ────────────────────────────────────────────────────────── */

const SearchResults: React.FC<{
  query: string;
  results: { tracks: { items: SpotifyTrack[] } } | null;
  loading: boolean;
  onPlay: (uri: string, index: number) => void;
  likedTracks: Set<string>;
  onToggleLike: (id: string) => void;
}> = ({ query, results, loading, onPlay, likedTracks, onToggleLike }) => (
  <section className="border-b-[2px] border-border-muted">
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <div className="mb-6">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-main">
          Search Results
        </span>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Results for &ldquo;{query}&rdquo;
        </h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-11 w-11" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      ) : results?.tracks?.items && results.tracks.items.length > 0 ? (
        <div className="space-y-1">
          {results.tracks.items.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              onPlay={onPlay}
              isLiked={likedTracks.has(track.id)}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm font-medium text-fg-subtle">
          No results found. Try a different search term.
        </p>
      )}
    </div>
  </section>
);

/* ────────────────────────────────────────────────────────── */
/*  Track Row (reusable for search + trending)               */
/* ────────────────────────────────────────────────────────── */

const TrackRow: React.FC<{
  track: SpotifyTrack;
  index: number;
  onPlay: (uri: string, index: number) => void;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
}> = ({ track, index, onPlay, isLiked, onToggleLike }) => (
  <div
    className="group flex cursor-pointer items-center gap-4 rounded-[5px] px-3 py-2.5 transition-all hover:bg-surface-hover md:px-4"
    onClick={() => onPlay(track.uri, index)}
  >
    <div className="flex h-8 w-8 shrink-0 items-center justify-center">
      <span className="text-sm font-bold tabular-nums text-fg-subtle group-hover:hidden">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="hidden text-foreground group-hover:block">
        <PlayIcon size={14} />
      </span>
    </div>

    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border-[2px] border-black shadow-brutal-sm md:h-11 md:w-11 overflow-hidden ${TRACK_COLORS[index % TRACK_COLORS.length]}`}>
      {track.album.images?.[0]?.url ? (
        <Image
          src={getImageUrl(track.album.images, "small") ?? ""}
          alt={track.album.name}
          className="h-full w-full object-cover"
          width={44}
          height={44}
        />
      ) : (
        <MusicNoteIcon size={14} />
      )}
    </div>

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-bold text-foreground">{track.name}</p>
      <p className="truncate text-xs font-medium text-fg-muted">
        {track.artists.map((a) => a.name).join(", ")}
      </p>
    </div>

    <span className="hidden truncate text-xs font-medium text-fg-subtle lg:block lg:w-36">
      {track.album.name}
    </span>

    <button
      onClick={(e) => { e.stopPropagation(); onToggleLike(track.id); }}
      className={`hidden cursor-pointer transition-colors md:block ${isLiked ? "text-pink-400" : "text-fg-subtle hover:text-pink-400"}`}
      aria-label={isLiked ? "Unlike" : "Like"}
    >
      <HeartIcon filled={isLiked} />
    </button>

    <span className="w-14 text-right font-mono text-xs text-fg-subtle">
      {formatDuration(track.duration_ms)}
    </span>
  </div>
);

/* ────────────────────────────────────────────────────────── */
/*  Trending                                                 */
/* ────────────────────────────────────────────────────────── */

const TIME_RANGE_LABELS = {
  short_term: "4 Weeks",
  medium_term: "6 Months",
  long_term: "All Time",
} as const;

const TrendingSection: React.FC<{
  isAuthenticated: boolean;
  spotifyTracks: SpotifyTrack[] | null;
  loading: boolean;
  timeRange: "short_term" | "medium_term" | "long_term";
  onTimeRangeChange: (range: "short_term" | "medium_term" | "long_term") => void;
  onPlay: (uri: string, index: number) => void;
  likedTracks: Set<string>;
  onToggleLike: (id: string) => void;
}> = ({
  isAuthenticated, spotifyTracks, loading,
  timeRange, onTimeRangeChange,
  onPlay, likedTracks, onToggleLike,
}) => (
  <section className="border-b-[2px] border-border-muted">
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-main">
            {isAuthenticated ? "Your Top Tracks" : "Hot Right Now"}
          </span>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {isAuthenticated ? "Most Played" : "Trending"}
          </h2>
        </div>

        {isAuthenticated && (
          <div className="flex gap-1.5">
            {(Object.keys(TIME_RANGE_LABELS) as (keyof typeof TIME_RANGE_LABELS)[]).map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`cursor-pointer rounded-[5px] border-[2px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                  timeRange === range
                    ? "border-black bg-main text-black shadow-brutal-sm"
                    : "border-border-muted bg-surface-hover text-fg-muted hover:border-border"
                }`}
              >
                {TIME_RANGE_LABELS[range]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table header */}
      <div className="mb-2 hidden items-center gap-4 border-b border-border-muted px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-fg-subtle md:flex">
        <span className="w-8 text-center">#</span>
        <span className="w-12" />
        <span className="flex-1">Title</span>
        <span className="hidden w-36 lg:block">Album</span>
        <span className="w-12" />
        <span className="w-14 text-right">Time</span>
      </div>

      {/* Tracks */}
      <div className="space-y-1">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-11 w-11" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="hidden h-3 w-24 lg:block" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))
        ) : isAuthenticated && spotifyTracks && spotifyTracks.length > 0 ? (
          spotifyTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              onPlay={onPlay}
              isLiked={likedTracks.has(track.id)}
              onToggleLike={onToggleLike}
            />
          ))
        ) : (
          FALLBACK_TRACKS.map((track, idx) => (
            <div
              key={track.id}
              className="group flex cursor-pointer items-center gap-4 rounded-[5px] px-3 py-2.5 transition-all hover:bg-surface-hover md:px-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                <span className="text-sm font-bold tabular-nums text-fg-subtle group-hover:hidden">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="hidden text-foreground group-hover:block">
                  <PlayIcon size={14} />
                </span>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border-[2px] border-black ${track.color} shadow-brutal-sm md:h-11 md:w-11`}>
                <MusicNoteIcon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{track.title}</p>
                <p className="truncate text-xs font-medium text-fg-muted">{track.artist}</p>
              </div>
              <span className="hidden truncate text-xs font-medium text-fg-subtle lg:block lg:w-36">{track.album}</span>
              <span className="hidden w-16 text-center text-xs font-medium tabular-nums text-fg-subtle md:block">{track.plays}</span>
              <button className="hidden cursor-pointer text-fg-subtle transition-colors hover:text-pink-400 md:block" aria-label="Like">
                <HeartIcon />
              </button>
              <span className="w-14 text-right font-mono text-xs text-fg-subtle">{track.duration}</span>
            </div>
          ))
        )}
      </div>
    </div>
  </section>
);

/* ────────────────────────────────────────────────────────── */
/*  Genre Mosaic                                             */
/* ────────────────────────────────────────────────────────── */

const GenreMosaic: React.FC = () => (
  <section className="border-b-[2px] border-border-muted">
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <div className="mb-6">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-main">Explore</span>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Browse Genres</h2>
      </div>

      <div className="grid auto-rows-[80px] grid-cols-4 gap-2.5 md:auto-rows-[100px] lg:grid-cols-6">
        {GENRES.map((genre) => (
          <button
            key={genre.name}
            className={`${genre.size} group relative cursor-pointer overflow-hidden rounded-[5px] border-[2px] border-black ${genre.color} shadow-brutal-sm transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal`}
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rotate-45 bg-black/[0.06]" />
            <div className="absolute bottom-3 left-4 text-left">
              <span className="text-sm font-bold text-black md:text-base">{genre.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  </section>
);

/* ────────────────────────────────────────────────────────── */
/*  Playlists                                                */
/* ────────────────────────────────────────────────────────── */

const PlaylistsSection: React.FC<{
  isAuthenticated: boolean;
  spotifyPlaylists: SpotifyPlaylist[] | null;
  loading: boolean;
  onPlayPlaylist: (uri: string) => void;
}> = ({ isAuthenticated, spotifyPlaylists, loading, onPlayPlaylist }) => (
  <section className="border-b-[2px] border-border-muted">
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-main">
            {isAuthenticated ? "Your Library" : "Made for you"}
          </span>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {isAuthenticated ? "Your Playlists" : "Popular Playlists"}
          </h2>
        </div>
        <a href="#" className="flex cursor-pointer items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-fg-muted transition-colors hover:text-foreground">
          View all <span className="text-sm">→</span>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[5px] border-[2px] border-border-muted bg-surface">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))
        ) : isAuthenticated && spotifyPlaylists && spotifyPlaylists.length > 0 ? (
          spotifyPlaylists.slice(0, 6).map((pl, idx) => (
            <div
              key={pl.id}
              className="group cursor-pointer overflow-hidden rounded-[5px] border-[2px] border-border-muted bg-surface transition-all hover:border-border hover:bg-surface-hover"
              onClick={() => onPlayPlaylist(pl.uri)}
            >
              <div className={`relative flex h-44 items-center justify-center border-b-[2px] border-black ${TRACK_COLORS[idx % TRACK_COLORS.length]} overflow-hidden`}>
                {pl.images?.[0]?.url ? (
                  <Image
                    src={pl.images[0].url}
                    alt={pl.name}
                    className="h-full w-full object-cover"
                    width={300}
                    height={176}
                  />
                ) : (
                  <>
                    <div className="absolute right-4 top-4 h-16 w-16 rounded-full border-[2px] border-black/10" />
                    <div className="absolute bottom-6 left-6 h-10 w-10 rounded-full border-[2px] border-black/10" />
                    <MusicNoteIcon size={40} />
                  </>
                )}
                <button
                  className="absolute bottom-3 right-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-[2px] border-black bg-black text-white opacity-0 shadow-brutal-sm transition-all group-hover:opacity-100"
                  aria-label={`Play ${pl.name}`}
                  onClick={(e) => { e.stopPropagation(); onPlayPlaylist(pl.uri); }}
                >
                  <PlayIcon size={16} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="mb-0.5 text-sm font-bold text-foreground">{pl.name}</h3>
                <p className="text-[11px] font-medium text-fg-subtle">
                  {(pl.items?.total ?? pl.tracks?.total ?? 0)} tracks
                  {pl.description && ` · ${pl.description.slice(0, 40)}${pl.description.length > 40 ? "…" : ""}`}
                </p>
              </div>
            </div>
          ))
        ) : (
          FALLBACK_PLAYLISTS.map((pl) => (
            <div key={pl.id} className="group cursor-pointer overflow-hidden rounded-[5px] border-[2px] border-border-muted bg-surface transition-all hover:border-border hover:bg-surface-hover">
              <div className={`relative flex h-44 items-center justify-center border-b-[2px] border-black ${pl.color}`}>
                <div className="absolute right-4 top-4 h-16 w-16 rounded-full border-[2px] border-black/10" />
                <div className="absolute bottom-6 left-6 h-10 w-10 rounded-full border-[2px] border-black/10" />
                <MusicNoteIcon size={40} />
                <button className="absolute bottom-3 right-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-[2px] border-black bg-black text-white opacity-0 shadow-brutal-sm transition-all group-hover:opacity-100" aria-label={`Play ${pl.name}`}>
                  <PlayIcon size={16} />
                </button>
              </div>
              <div className="p-4" suppressHydrationWarning>
                <h3 className="mb-0.5 text-sm font-bold text-foreground">{pl.name}</h3>
                <p className="text-[11px] font-medium text-fg-subtle">{pl.tracks} tracks</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </section>
);

/* ────────────────────────────────────────────────────────── */
/*  Artists                                                  */
/* ────────────────────────────────────────────────────────── */

const ArtistsSection: React.FC<{
  isAuthenticated: boolean;
  spotifyArtists: SpotifyArtist[] | null;
  loading: boolean;
}> = ({ isAuthenticated, spotifyArtists, loading }) => (
  <section className="border-b-[2px] border-border-muted">
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <div className="mb-6">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-main">
          {isAuthenticated ? "Your Favorites" : "Fan Favorites"}
        </span>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Top Artists</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[5px] border-[2px] border-border-muted bg-surface p-5 text-center">
              <Skeleton className="mx-auto mb-3 h-20 w-20 rounded-full" />
              <Skeleton className="mx-auto mb-1 h-4 w-20" />
              <Skeleton className="mx-auto h-3 w-14" />
            </div>
          ))
        ) : isAuthenticated && spotifyArtists && spotifyArtists.length > 0 ? (
          spotifyArtists.slice(0, 6).map((artist, idx) => (
            <div key={artist.id} className="group cursor-pointer rounded-[5px] border-[2px] border-border-muted bg-surface p-5 text-center transition-all hover:border-border hover:bg-surface-hover">
              <div className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-[2px] border-black ${TRACK_COLORS[idx % TRACK_COLORS.length]} overflow-hidden text-lg font-bold text-black shadow-brutal-sm transition-shadow group-hover:shadow-brutal`}>
                {artist.images?.[0]?.url ? (
                  <Image
                    src={getImageUrl(artist.images, "small") ?? ""}
                    alt={artist.name}
                    className="h-full w-full object-cover"
                    width={80}
                    height={80}
                  />
                ) : (
                  artist.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <h3 className="mb-0.5 truncate text-sm font-bold text-foreground">{artist.name}</h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-fg-subtle">
                {artist.genres?.[0] ?? "Artist"}
              </p>
            </div>
          ))
        ) : (
          FALLBACK_ARTISTS.map((artist) => (
            <div key={artist.name} className="group cursor-pointer rounded-[5px] border-[2px] border-border-muted bg-surface p-5 text-center transition-all hover:border-border hover:bg-surface-hover">
              <div className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-[2px] border-black ${artist.color} text-lg font-bold text-black shadow-brutal-sm transition-shadow group-hover:shadow-brutal`}>
                {artist.initial}
              </div>
              <h3 className="mb-0.5 truncate text-sm font-bold text-foreground">{artist.name}</h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-fg-subtle">{artist.listeners}</p>
            </div>
          ))
        )}
      </div>
    </div>
  </section>
);

/* ────────────────────────────────────────────────────────── */
/*  Footer                                                   */
/* ────────────────────────────────────────────────────────── */

const FooterSection: React.FC = () => (
  <footer className="bg-bg-secondary pb-28">
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[5px] border-[2px] border-border-muted bg-main">
            <MusicNoteIcon size={14} />
          </span>
          <span className="text-lg font-bold text-fg-muted">
            neo<span className="text-main">beats</span>
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium text-fg-subtle">
          <a href="#" className="cursor-pointer rounded transition-colors hover:text-fg-muted focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-2">About</a>
          <a href="#" className="cursor-pointer rounded transition-colors hover:text-fg-muted focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-2">Privacy</a>
          <a href="#" className="cursor-pointer rounded transition-colors hover:text-fg-muted focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-2">Terms</a>
          <a href="#" className="cursor-pointer rounded transition-colors hover:text-fg-muted focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-2">Contact</a>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-medium text-fg-subtle">
          <SpotifyLogo />
          <span>Powered by Spotify Web API</span>
        </div>

        <p className="text-[10px] font-medium text-fg-subtle" suppressHydrationWarning>
          © {CURRENT_YEAR} neobeats. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

/* ────────────────────────────────────────────────────────── */
/*  Player Bar                                               */
/* ────────────────────────────────────────────────────────── */

interface PlayerBarProps {
  isPlaying: boolean;
  onToggle: () => void;
  isAuthenticated: boolean;
  spotifyTrack: SpotifyTrack | null;
  fallbackTrack: (typeof FALLBACK_TRACKS)[number];
  onNext: () => void;
  onPrev: () => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  isPlaying, onToggle, isAuthenticated, spotifyTrack, fallbackTrack,
  onNext, onPrev,
}) => {
  const trackTitle = isAuthenticated && spotifyTrack ? spotifyTrack.name : fallbackTrack.title;
  const trackArtist = isAuthenticated && spotifyTrack ? spotifyTrack.artists.map((a) => a.name).join(", ") : fallbackTrack.artist;
  const trackDuration = isAuthenticated && spotifyTrack ? formatDuration(spotifyTrack.duration_ms) : fallbackTrack.duration;
  const trackColor = isAuthenticated && spotifyTrack ? TRACK_COLORS[spotifyTrack.name.charCodeAt(0) % TRACK_COLORS.length] : fallbackTrack.color;
  const albumImage = isAuthenticated && spotifyTrack ? getImageUrl(spotifyTrack.album.images, "small") : null;

  return (
    <div className="relative z-50 shrink-0 border-t-[2px] border-border-muted bg-background">
      <div className="absolute -top-[2px] left-0 h-[2px] w-full">
        <div className="h-full w-[35%] bg-main transition-all" />
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-2 md:px-6">
        {/* Track Info */}
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border-[2px] border-black ${trackColor} shadow-brutal-sm ${isPlaying ? "animate-[spin_8s_linear_infinite]" : ""}`}>
            {albumImage ? (
              <Image
                src={albumImage}
                alt={trackTitle}
                className="h-full w-full object-cover"
                width={48}
                height={48}
              />
            ) : (
              <MusicNoteIcon size={16} />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{trackTitle}</p>
            <p className="truncate text-[11px] font-medium text-fg-subtle">{trackArtist}</p>
          </div>
          <button className="ml-2 hidden cursor-pointer text-fg-subtle transition-colors hover:text-pink-400 sm:block" aria-label="Like">
            <HeartIcon />
          </button>
        </div>

        {/* Center controls */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button className="hidden cursor-pointer text-fg-subtle transition-colors hover:text-foreground sm:block" aria-label="Shuffle">
              <ShuffleIcon />
            </button>
            <button onClick={onPrev} className="cursor-pointer text-fg-muted transition-colors hover:text-foreground" aria-label="Previous">
              <SkipBackIcon />
            </button>
            <button
              onClick={onToggle}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[5px] border-[2px] border-black bg-main text-black shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
            </button>
            <button onClick={onNext} className="cursor-pointer text-fg-muted transition-colors hover:text-foreground" aria-label="Next">
              <SkipForwardIcon />
            </button>
            <button className="hidden cursor-pointer text-fg-subtle transition-colors hover:text-foreground sm:block" aria-label="Repeat">
              <RepeatIcon />
            </button>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <span className="w-8 text-right font-mono text-[10px] tabular-nums text-fg-subtle">1:24</span>
            <div className="group relative h-1 w-48 cursor-pointer rounded-full bg-border-muted lg:w-96">
              <div className="h-full w-[35%] rounded-full bg-main transition-all" />
              <div className="absolute left-[35%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2px] border-main bg-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <span className="w-8 font-mono text-[10px] tabular-nums text-fg-subtle">{trackDuration}</span>
          </div>
        </div>

        {/* Right: Volume + extras */}
        <div className="hidden items-center gap-3 lg:flex">
          <button className="cursor-pointer text-fg-subtle transition-colors hover:text-foreground" aria-label="Lyrics">
            <MicIcon />
          </button>
          <button className="cursor-pointer text-fg-subtle transition-colors hover:text-foreground" aria-label="Queue">
            <ListIcon />
          </button>
          <div className="mx-1 h-4 w-px bg-border-muted" />
          <button className="cursor-pointer text-fg-subtle transition-colors hover:text-foreground" aria-label="Volume">
            <VolumeIcon />
          </button>
          <div className="group relative h-1 w-24 cursor-pointer rounded-full bg-border-muted">
            <div className="h-full w-[70%] rounded-full bg-fg-muted transition-colors group-hover:bg-main" />
            <div className="absolute left-[70%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </div>
    </div>
  );
};
