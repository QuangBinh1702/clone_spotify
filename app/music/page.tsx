"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import MusicShell from "@/app/music/components/MusicShell";
import { useMusicContext, FALLBACK_TRACKS, TRACK_COLORS } from "@/app/music/context";
import type { FallbackTrack } from "@/app/music/context";
import {
  useTopTracks,
  useTopArtists,
  usePlaylists,
  useSavedTracks,
  useSearch,
  useBrowseTracks,
  useFeaturedPlaylists,
  useBrowseCategories,
} from "@/app/lib/hooks";
import {
  formatDuration,
  getImageUrl,
  type SpotifyTrack,
  type SpotifyPlaylist,
  type SpotifyArtist,
} from "@/app/lib/spotify";

const CURRENT_YEAR = new Date().getFullYear();

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

const GENRE_COLORS_MAP = [
  "bg-cyan-300", "bg-yellow-300", "bg-pink-300", "bg-green-300",
  "bg-orange-300", "bg-purple-300", "bg-red-300", "bg-amber-200",
  "bg-lime-300", "bg-teal-300", "bg-rose-300", "bg-indigo-300",
  "bg-emerald-300", "bg-fuchsia-300", "bg-sky-300", "bg-violet-300",
  "bg-blue-300", "bg-slate-300", "bg-stone-300", "bg-zinc-300",
];

const GENRE_SIZES = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
];

const FALLBACK_GENRES = [
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

const MusicNoteIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
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
  const {
    isAuthenticated, isPlaying, togglePlay,
    currentTrackIndex, currentTrack, currentFallbackTrack,
    embedUri, likedTracks, toggleLike,
    searchQuery, activeSearchQuery, handleSearchInput,
    playTrack, playPlaylist, login, logout,
    browseTracks, browseLoading,
    nextTrack, prevTrack, hasPreview,
    effectiveTracks: ctxEffectiveTracks,
  } = useMusicContext();

  const [timeRange, setTimeRange] = useState<"short_term" | "medium_term" | "long_term">("medium_term");

  const { data: topTracks, loading: topTracksLoading } = useTopTracks(timeRange);
  const { data: topArtists, loading: topArtistsLoading } = useTopArtists();
  const { data: playlists, loading: playlistsLoading } = usePlaylists();
  const { data: savedTracks } = useSavedTracks();
  const { data: searchResults, loading: searchLoading } = useSearch(activeSearchQuery);

  // Public browse data for non-auth or empty auth
  const { data: featuredPlaylists, loading: featuredLoading } = useFeaturedPlaylists();
  const { data: browseCategories, loading: categoriesLoading } = useBrowseCategories();

  // Determine effective data: user data if available, else browse data
  const effectiveTracks = (isAuthenticated && topTracks?.items && topTracks.items.length > 0)
    ? topTracks.items
    : browseTracks.length > 0 ? browseTracks : null;
  const effectiveTracksLoading = isAuthenticated ? topTracksLoading : browseLoading;

  const effectivePlaylists = (isAuthenticated && playlists?.items && playlists.items.length > 0)
    ? playlists.items
    : featuredPlaylists?.items ?? null;
  const effectivePlaylistsLoading = isAuthenticated ? playlistsLoading : featuredLoading;

  const fallbackDisplayTracks = useMemo(() => ctxEffectiveTracks.length > 0 ? ctxEffectiveTracks : browseTracks, [ctxEffectiveTracks, browseTracks]);

  const likedDisplayTracks = useMemo(() => {
    // Prioritize saved tracks, then liked IDs intersecting available tracks
    if (isAuthenticated && savedTracks?.items && savedTracks.items.length > 0) {
      return savedTracks.items.slice(0, 8).map((item) => item.track).filter(Boolean);
    }
    if (likedTracks.size > 0) {
      return ctxEffectiveTracks.filter((t) => likedTracks.has(t.id)).slice(0, 8);
    }
    return [] as SpotifyTrack[];
  }, [ctxEffectiveTracks, likedTracks, savedTracks, isAuthenticated]);

  return (
    <MusicShell
      title="Home"
      subtitle={isAuthenticated ? "Listening now" : "Discover new sounds"}
      showSearch
      searchQuery={searchQuery}
      onSearchChange={handleSearchInput}
      headerActions={
        !isAuthenticated ? (
          <button
            onClick={login}
            className="rounded-full bg-main px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-black"
          >
            Connect Spotify
          </button>
        ) : (
          <button
            onClick={logout}
            className="rounded-full border border-border-muted bg-surface px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-fg-subtle"
          >
            Disconnect
          </button>
        )
      }
      rightRail={
        <NowPlayingPanel
          isAuthenticated={isAuthenticated}
          track={currentTrack}
          fallbackTrack={currentFallbackTrack}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onNext={nextTrack}
          onPrev={prevTrack}
          hasPreview={hasPreview}
          effectiveTracks={ctxEffectiveTracks}
          currentTrackIndex={currentTrackIndex}
        />
      }
    >
      {/* Search results overlay */}
      {activeSearchQuery && isAuthenticated && (
        <SearchResults
          query={activeSearchQuery}
          results={searchResults}
          loading={searchLoading}
          onPlay={playTrack}
          likedTracks={likedTracks}
          onToggleLike={toggleLike}
        />
      )}

      {!activeSearchQuery && (
        <>
          <HeroSection isPlaying={isPlaying} onToggle={togglePlay} isAuthenticated={isAuthenticated} />
          <QuickPicks isAuthenticated={isAuthenticated} savedTracks={savedTracks?.items ?? null} browseTracks={browseTracks} onPlay={playTrack} />

          <FavoritesSection
            isAuthenticated={isAuthenticated}
            favoriteTracks={likedDisplayTracks}
            loading={searchLoading || (isAuthenticated && topTracksLoading && savedTracks === undefined)}
            onPlay={playTrack}
          />

          <LibraryShortcuts
            isAuthenticated={isAuthenticated}
            playlists={effectivePlaylists}
            savedCount={savedTracks?.items?.length ?? 0}
          />

          <TrendingSection
            isAuthenticated={isAuthenticated}
            spotifyTracks={effectiveTracks}
            loading={effectiveTracksLoading}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            onPlay={playTrack}
            likedTracks={likedTracks}
            onToggleLike={toggleLike}
          />

          <TrackListSection
            tracks={fallbackDisplayTracks}
            fallback={FALLBACK_TRACKS}
            onPlay={playTrack}
            likedTracks={likedTracks}
            onToggleLike={toggleLike}
          />

          <GenreMosaic categories={browseCategories?.items ?? null} loading={categoriesLoading} />

          <PlaylistsSection
            isAuthenticated={isAuthenticated}
            spotifyPlaylists={effectivePlaylists}
            loading={effectivePlaylistsLoading}
            onPlayPlaylist={playPlaylist}
          />

          <ArtistsSection
            isAuthenticated={isAuthenticated}
            spotifyArtists={topArtists?.items ?? null}
            loading={topArtistsLoading}
          />

          <FooterSection />
        </>
      )}
    </MusicShell>
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
  browseTracks: SpotifyTrack[];
  onPlay: (track: SpotifyTrack, index: number) => void;
}> = ({ isAuthenticated, savedTracks, browseTracks, onPlay }) => {
  // Use saved tracks if authenticated and available, else browse tracks, else fallback
  const hasSaved = isAuthenticated && savedTracks && savedTracks.length > 0;
  const hasBrowse = browseTracks.length > 0;

  const picks = hasSaved
    ? savedTracks!.slice(0, 6).map((item, idx) => ({
        title: item.track.name,
        subtitle: item.track.artists.map((a) => a.name).join(", "),
        color: TRACK_COLORS[item.track.name.charCodeAt(0) % TRACK_COLORS.length],
        image: getImageUrl(item.track.album.images, "small"),
        spotifyTrack: item.track,
        idx,
      }))
    : hasBrowse
      ? browseTracks.slice(0, 6).map((track, idx) => ({
          title: track.name,
          subtitle: track.artists.map((a) => a.name).join(", "),
          color: TRACK_COLORS[track.name.charCodeAt(0) % TRACK_COLORS.length],
          image: getImageUrl(track.album.images, "small"),
          spotifyTrack: track,
          idx,
        }))
      : QUICK_PICKS.map((p) => ({
          ...p,
          image: null as string | null,
          spotifyTrack: null as SpotifyTrack | null,
          idx: 0,
        }));

  return (
    <section className="border-b-[2px] border-border-muted bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((pick) => (
            <button
              key={pick.title}
              className="group flex cursor-pointer items-center gap-3 overflow-hidden rounded-[5px] border-[2px] border-border-muted bg-surface-hover transition-all hover:border-border hover:bg-surface-hover"
              onClick={() => {
                if (pick.spotifyTrack) onPlay(pick.spotifyTrack, pick.idx);
              }}
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
/*  Favorites                                                 */
/* ────────────────────────────────────────────────────────── */

const FavoritesSection: React.FC<{
  isAuthenticated: boolean;
  favoriteTracks: SpotifyTrack[];
  loading: boolean;
  onPlay: (track: SpotifyTrack, index: number) => void;
}> = ({ isAuthenticated, favoriteTracks, loading, onPlay }) => (
  <section className="border-b-[2px] border-border-muted bg-background">
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-main">
            {isAuthenticated ? "Yêu thích" : "Bộ sưu tập"}
          </span>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Favorites</h2>
          <p className="text-sm text-fg-subtle">Những bài bạn đã lưu hoặc thả tim gần đây.</p>
        </div>
        <a href="/music/library" className="text-xs font-bold uppercase tracking-wider text-fg-muted transition-colors hover:text-foreground">
          Xem thư viện →
        </a>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[5px] border-[2px] border-border-muted bg-surface p-4">
              <Skeleton className="mb-3 h-10 w-full" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      ) : favoriteTracks.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteTracks.slice(0, 6).map((track, idx) => (
            <button
              key={track.id}
              onClick={() => onPlay(track, idx)}
              className="group flex items-center gap-3 rounded-[6px] border-[2px] border-border-muted bg-surface px-4 py-3 text-left transition-all hover:border-border hover:bg-surface-hover"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] border-[2px] border-black ${TRACK_COLORS[idx % TRACK_COLORS.length]} overflow-hidden shadow-brutal-sm`}>
                {track.album.images?.[0]?.url ? (
                  <Image src={getImageUrl(track.album.images, "small") ?? ""} alt={track.name} className="h-full w-full object-cover" width={48} height={48} />
                ) : (
                  <MusicNoteIcon size={16} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{track.name}</p>
                <p className="truncate text-[11px] font-medium text-fg-subtle">{track.artists.map((a) => a.name).join(", ")}</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-fg-subtle">
                <PlayIcon size={12} />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-[6px] border-[2px] border-border-muted bg-surface px-4 py-5 text-sm font-medium text-fg-subtle">
          Chưa có bài yêu thích. Hãy thả tim một bài hát để thấy danh sách này.
        </div>
      )}
    </div>
  </section>
);

/* ────────────────────────────────────────────────────────── */
/*  Library Shortcuts                                         */
/* ────────────────────────────────────────────────────────── */

const LibraryShortcuts: React.FC<{
  isAuthenticated: boolean;
  playlists: SpotifyPlaylist[] | null;
  savedCount: number;
}> = ({ isAuthenticated, playlists, savedCount }) => (
  <section className="border-b-[2px] border-border-muted bg-background">
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-main">Thư viện</span>
          <h2 className="text-xl font-bold tracking-tight">Nhanh tay mở nhạc</h2>
        </div>
        <a href="/music/library" className="text-xs font-bold uppercase tracking-wider text-fg-muted transition-colors hover:text-foreground">
          Mở Library
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a href="/music/library" className="group flex h-full items-center justify-between rounded-[6px] border-[2px] border-border-muted bg-surface px-4 py-3 transition-all hover:border-border hover:bg-surface-hover">
          <div>
            <p className="text-sm font-bold text-foreground">Tất cả Playlist</p>
            <p className="text-[11px] font-medium text-fg-subtle">{playlists ? `${playlists.length} playlist` : "Khám phá playlist"}</p>
          </div>
          <div className="rounded-full border-[2px] border-black bg-main px-3 py-1 text-[11px] font-bold text-black shadow-brutal-sm">→</div>
        </a>

        <a href="/music/library" className="group flex h-full items-center justify-between rounded-[6px] border-[2px] border-border-muted bg-surface px-4 py-3 transition-all hover:border-border hover:bg-surface-hover">
          <div>
            <p className="text-sm font-bold text-foreground">Bài đã lưu</p>
            <p className="text-[11px] font-medium text-fg-subtle">{savedCount > 0 ? `${savedCount} bài đã lưu` : "Chưa có bài đã lưu"}</p>
          </div>
          <div className="rounded-full border-[2px] border-black bg-main px-3 py-1 text-[11px] font-bold text-black shadow-brutal-sm">♥</div>
        </a>

        <div className="flex h-full items-center justify-between rounded-[6px] border-[2px] border-dashed border-border-muted bg-surface px-4 py-3 text-left text-sm font-medium text-fg-subtle">
          Gợi ý: tạo playlist mới từ gợi ý trending.
        </div>
      </div>
    </div>
  </section>
);

/* ────────────────────────────────────────────────────────── */
/*  Search Results                                           */
/* ────────────────────────────────────────────────────────── */

const SearchResults: React.FC<{
  query: string;
  results: { tracks?: { items: SpotifyTrack[] } } | null;
  loading: boolean;
  onPlay: (track: SpotifyTrack, index: number) => void;
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
  onPlay: (track: SpotifyTrack, index: number) => void;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
}> = ({ track, index, onPlay, isLiked, onToggleLike }) => (
  <div
    className="group flex cursor-pointer items-center gap-4 rounded-[5px] px-3 py-2.5 transition-all hover:bg-surface-hover md:px-4"
    onClick={() => onPlay(track, index)}
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
      <div className="flex items-center gap-2">
        <p className="truncate text-sm font-bold text-foreground">{track.name}</p>
        {track.preview_url && (
          <span className="shrink-0 rounded bg-main/20 px-1 py-0.5 text-[8px] font-bold uppercase text-main">
            Preview
          </span>
        )}
      </div>
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
  onPlay: (track: SpotifyTrack, index: number) => void;
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
        ) : spotifyTracks && spotifyTracks.length > 0 ? (
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
/*  Track List (always visible)                              */
/* ────────────────────────────────────────────────────────── */

const TrackListSection: React.FC<{
  tracks: SpotifyTrack[];
  fallback: typeof FALLBACK_TRACKS;
  onPlay: (track: SpotifyTrack, index: number) => void;
  likedTracks: Set<string>;
  onToggleLike: (id: string) => void;
}> = ({ tracks, fallback, onPlay, likedTracks, onToggleLike }) => (
  <section className="border-b-[2px] border-border-muted">
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-main">Danh sách nhạc</span>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Đang phát hành</h2>
          <p className="text-sm text-fg-subtle">Luôn có nhạc để nghe — kể cả khi bạn chưa đăng nhập.</p>
        </div>
      </div>

      <div className="space-y-1">
        {tracks && tracks.length > 0 ? (
          tracks.slice(0, 12).map((track, idx) => (
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
          fallback.slice(0, 8).map((track, idx) => (
            <div key={track.id} className="flex items-center gap-4 rounded-[5px] px-3 py-2.5 transition-all hover:bg-surface-hover md:px-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                <span className="text-sm font-bold tabular-nums text-fg-subtle">{String(idx + 1).padStart(2, "0")}</span>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border-[2px] border-black ${track.color} shadow-brutal-sm md:h-11 md:w-11`}>
                <MusicNoteIcon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{track.title}</p>
                <p className="truncate text-xs font-medium text-fg-muted">{track.artist}</p>
              </div>
              <span className="hidden truncate text-xs font-medium text-fg-subtle lg:block lg:w-36">{track.album}</span>
              <span className="w-14 text-right font-mono text-xs text-fg-subtle">{track.duration}</span>
            </div>
          ))
        )}
      </div>
    </div>
  </section>
);

/* ────────────────────────────────────────────────────────── */
/*  Genre Mosaic (now with real Spotify categories)          */
/* ────────────────────────────────────────────────────────── */

const GenreMosaic: React.FC<{
  categories: { id: string; name: string; icons: { url: string }[] }[] | null;
  loading: boolean;
}> = ({ categories, loading }) => {
  const genreItems = categories && categories.length > 0
    ? categories.slice(0, 8).map((cat, idx) => ({
        name: cat.name,
        color: GENRE_COLORS_MAP[idx % GENRE_COLORS_MAP.length],
        size: GENRE_SIZES[idx % GENRE_SIZES.length],
        icon: cat.icons?.[0]?.url ?? null,
      }))
    : FALLBACK_GENRES.map((g) => ({ ...g, icon: null as string | null }));

  return (
    <section className="border-b-[2px] border-border-muted">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-6">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-main">Explore</span>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Browse Genres</h2>
        </div>

        {loading ? (
          <div className="grid auto-rows-[80px] grid-cols-4 gap-2.5 md:auto-rows-[100px] lg:grid-cols-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={`rounded-[5px] ${GENRE_SIZES[i % GENRE_SIZES.length]}`} />
            ))}
          </div>
        ) : (
          <div className="grid auto-rows-[80px] grid-cols-4 gap-2.5 md:auto-rows-[100px] lg:grid-cols-6">
            {genreItems.map((genre) => (
              <button
                key={genre.name}
                className={`${genre.size} group relative cursor-pointer overflow-hidden rounded-[5px] border-[2px] border-black ${genre.color} shadow-brutal-sm transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal`}
              >
                {genre.icon && (
                  <Image
                    src={genre.icon}
                    alt={genre.name}
                    className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30 transition-opacity group-hover:opacity-50"
                    width={100}
                    height={100}
                  />
                )}
                <div className="absolute -right-8 -top-8 h-24 w-24 rotate-45 bg-black/[0.06]" />
                <div className="absolute bottom-3 left-4 text-left">
                  <span className="text-sm font-bold text-black md:text-base">{genre.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

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
            {isAuthenticated && spotifyPlaylists ? "Your Library" : "Featured"}
          </span>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {isAuthenticated && spotifyPlaylists ? "Your Playlists" : "Popular Playlists"}
          </h2>
        </div>
        <a href="#" className="flex cursor-pointer items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-fg-muted transition-colors hover:text-foreground">
          View all <span className="text-sm">&rarr;</span>
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
        ) : spotifyPlaylists && spotifyPlaylists.length > 0 ? (
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
                  {pl.description && ` · ${pl.description.slice(0, 40)}${pl.description.length > 40 ? "..." : ""}`}
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
          &copy; {CURRENT_YEAR} neobeats. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

/* ────────────────────────────────────────────────────────── */
/*  Now Playing Panel (right rail) — fully interactive       */
/* ────────────────────────────────────────────────────────── */

const NowPlayingPanel: React.FC<{
  isAuthenticated: boolean;
  track: SpotifyTrack | null;
  fallbackTrack: FallbackTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasPreview: boolean;
  effectiveTracks: SpotifyTrack[];
  currentTrackIndex: number;
}> = ({ isAuthenticated, track, fallbackTrack, isPlaying, onTogglePlay, onNext, onPrev, hasPreview, effectiveTracks, currentTrackIndex }) => {
  const hasTrack = !!track;
  const trackTitle = track ? track.name : fallbackTrack.title;
  const trackArtist = track
    ? track.artists.map((a) => a.name).join(", ")
    : fallbackTrack.artist;
  const trackAlbum = track ? track.album.name : fallbackTrack.album;
  const albumImage = track ? getImageUrl(track.album.images, "medium") : null;

  return (
    <div className="sticky top-[72px] space-y-4">
      <div className="rounded-[16px] bg-surface p-4 shadow-brutal-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-fg-subtle">
          Now Playing
        </p>
        <div className="mt-4 overflow-hidden rounded-[14px] border border-border-muted bg-background">
          <div className="relative h-44 w-full overflow-hidden">
            {albumImage ? (
              <Image
                src={albumImage}
                alt={trackTitle}
                className="h-full w-full object-cover"
                width={320}
                height={176}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-main text-black">
                <MusicNoteIcon size={32} />
              </div>
            )}
            {/* Play overlay on album art */}
            <button
              onClick={onTogglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/30"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-main/90 text-black opacity-0 shadow-lg transition-opacity hover:opacity-100 group-hover:opacity-100"
                style={{ opacity: isPlaying ? 0.8 : undefined }}
              >
                {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
              </div>
            </button>
          </div>
          <div className="space-y-1 px-4 py-3">
            <p className="text-sm font-bold">{trackTitle}</p>
            <p className="text-xs text-fg-subtle">{trackArtist}</p>
            <p className="text-[11px] text-fg-subtle">{trackAlbum}</p>
          </div>
          {/* Player controls */}
          <div className="flex items-center justify-center gap-4 px-4 pb-4">
            <button
              onClick={onPrev}
              className="cursor-pointer text-fg-muted transition-colors hover:text-foreground"
              aria-label="Previous"
            >
              <SkipBackIcon />
            </button>
            <button
              onClick={onTogglePlay}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-main text-black shadow-brutal-sm transition-all hover:scale-105"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
            </button>
            <button
              onClick={onNext}
              className="cursor-pointer text-fg-muted transition-colors hover:text-foreground"
              aria-label="Next"
            >
              <SkipForwardIcon />
            </button>
          </div>
          {/* Preview availability indicator */}
          {hasTrack && !hasPreview && (
            <div className="border-t border-border-muted px-4 py-2">
              <p className="text-center text-[10px] font-medium text-fg-subtle">
                No preview available. Use Spotify embed below to listen.
              </p>
            </div>
          )}
          {hasTrack && hasPreview && (
            <div className="border-t border-border-muted px-4 py-2">
              <p className="text-center text-[10px] font-medium text-main">
                Playing 30s preview
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[16px] bg-surface p-4 shadow-brutal-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-fg-subtle">
          Up Next
        </p>
        <div className="mt-3 space-y-3">
          {effectiveTracks.length > 0
            ? Array.from({ length: 3 }).map((_, offset) => {
                const idx = (currentTrackIndex + 1 + offset) % effectiveTracks.length;
                const upNext = effectiveTracks[idx];
                if (!upNext) return null;
                return (
                  <div key={upNext.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{upNext.name}</p>
                      <p className="truncate text-[11px] text-fg-subtle">
                        {upNext.artists.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                    <span className="ml-2 shrink-0 text-[10px] font-semibold text-fg-subtle">
                      {formatDuration(upNext.duration_ms)}
                    </span>
                  </div>
                );
              })
            : FALLBACK_TRACKS.slice(0, 3).map((next) => (
                <div key={next.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{next.title}</p>
                    <p className="text-[11px] text-fg-subtle">{next.artist}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-fg-subtle">{next.duration}</span>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
};
