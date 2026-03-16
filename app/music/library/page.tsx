"use client";

import React from "react";
import Image from "next/image";
import MusicShell from "@/app/music/components/MusicShell";
import { usePlaylists, useSavedTracks, useRecentlyPlayed, useTopArtists, useAlbums } from "@/app/lib/hooks";
import { useMusicContext } from "@/app/music/context";
import { formatDuration, getImageUrl } from "@/app/lib/spotify";

/* ─── Skeleton ─── */

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-[5px] bg-border-muted ${className}`} />
);

/* ─── Fallback data (unauthenticated) ─── */

const FALLBACK_STATS = [
  { label: "Playlists", value: "24", color: "bg-yellow-300" },
  { label: "Liked Songs", value: "312", color: "bg-pink-300" },
  { label: "Artists", value: "86", color: "bg-cyan-300" },
  { label: "Albums", value: "41", color: "bg-green-300" },
];

const FALLBACK_PLAYLISTS = [
  { name: "Chill Brutalism", tracks: 28, vibe: "Lo-fi · Focus", color: "bg-green-300" },
  { name: "Late Night Code", tracks: 64, vibe: "Synth · Ambient", color: "bg-purple-300" },
  { name: "Workout Raw", tracks: 35, vibe: "EDM · Energy", color: "bg-red-300" },
  { name: "Focus Mode", tracks: 51, vibe: "Instrumental", color: "bg-cyan-300" },
  { name: "Retro Waves", tracks: 42, vibe: "Analog · 90s", color: "bg-yellow-300" },
  { name: "Indie Bold", tracks: 37, vibe: "Indie · Alt", color: "bg-pink-300" },
];

const FALLBACK_RECENT = [
  { title: "Pixel Heart", subtitle: "Neon Flux · 3:24", time: "2m ago" },
  { title: "Concrete Dreams", subtitle: "Echo Chamber · Album", time: "12m ago" },
  { title: "Discovery Weekly", subtitle: "Playlist · 30 tracks", time: "1h ago" },
  { title: "Brutal Sunrise", subtitle: "Echo Chamber · 3:06", time: "3h ago" },
];

const PLAYLIST_COLORS = [
  "bg-green-300", "bg-purple-300", "bg-red-300",
  "bg-cyan-300", "bg-yellow-300", "bg-pink-300",
];

/* ─── Helpers ─── */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ─── Page ─── */

const LibraryPage: React.FC = () => {
  const { isAuthenticated, login, playPlaylist, playTrack } = useMusicContext();
  const { data: playlistsData, loading: playlistsLoading } = usePlaylists();
  const { data: savedData, loading: savedLoading } = useSavedTracks();
  const { data: recentData, loading: recentLoading } = useRecentlyPlayed();
  const { data: topArtists, loading: artistsLoading } = useTopArtists();
  const { data: albumsData, loading: albumsLoading } = useAlbums();

  const isLoading = isAuthenticated && (playlistsLoading || savedLoading || recentLoading || artistsLoading || albumsLoading);

  /* ── Stats ── */
  const stats = isAuthenticated
    ? [
        { label: "Playlists", value: String(playlistsData?.total ?? 0), color: "bg-yellow-300" },
        { label: "Liked Songs", value: String(savedData?.total ?? 0), color: "bg-pink-300" },
        { label: "Artists", value: "—", color: "bg-cyan-300" },
        { label: "Albums", value: "—", color: "bg-green-300" },
      ]
    : FALLBACK_STATS;

  return (
    <MusicShell title="Library" subtitle="Curate your collection">
      {/* ── Header + Stats ── */}
      <section className="rounded-[18px] bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-fg-subtle">
              Your Library
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Everything you love, organized.
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium text-fg-subtle">
              Pin your favorite mixes, dive into saved albums, and keep your
              listening history close by.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isAuthenticated && (
              <button
                onClick={login}
                className="rounded-full bg-[#1DB954] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black"
              >
                Connect Spotify
              </button>
            )}
            <button className="rounded-full bg-main px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black">
              New Playlist
            </button>
            <button className="rounded-full border border-border-muted bg-background px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
              Import
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-[14px] border border-border-muted bg-background p-4"
                >
                  <Skeleton className="h-12 w-12 rounded-[10px]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            : stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 rounded-[14px] border border-border-muted bg-background p-4"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-[10px] border border-border-muted ${stat.color} text-sm font-bold text-black`}
                  >
                    {stat.value}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
                      {stat.label}
                    </p>
                    <p className="text-sm font-medium text-fg-subtle">Updated just now</p>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* ── Playlists + Recent Activity ── */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
        {/* Playlists */}
        <div className="rounded-[16px] bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Pinned playlists</h3>
            <button className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
              Manage
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-[14px] border border-border-muted bg-background p-3"
                  >
                    <Skeleton className="h-14 w-14 rounded-[10px]" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              : isAuthenticated && playlistsData?.items
                ? playlistsData.items.map((playlist, idx) => {
                    const imgUrl = getImageUrl(playlist.images, "small");
                    return (
                      <div
                        key={playlist.id}
                        className="group flex items-center gap-3 rounded-[14px] border border-border-muted bg-background p-3 transition-all hover:border-border"
                      >
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={playlist.name}
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-[10px] border border-border-muted object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-[10px] border border-border-muted ${PLAYLIST_COLORS[idx % PLAYLIST_COLORS.length]} text-xs font-bold text-black`}
                          >
                            {playlist.tracks?.total ?? 0}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{playlist.name}</p>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                            {playlist.tracks?.total ?? 0} tracks · {playlist.owner.display_name ?? "You"}
                          </p>
                        </div>
                        <button
                          onClick={() => playPlaylist(playlist.uri)}
                          className="ml-auto hidden rounded-full bg-main px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black group-hover:flex"
                        >
                          Play
                        </button>
                      </div>
                    );
                  })
                : FALLBACK_PLAYLISTS.map((playlist) => (
                    <div
                      key={playlist.name}
                      className="group flex items-center gap-3 rounded-[14px] border border-border-muted bg-background p-3 transition-all hover:border-border"
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-[10px] border border-border-muted ${playlist.color} text-xs font-bold text-black`}
                      >
                        {playlist.tracks}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{playlist.name}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                          {playlist.vibe}
                        </p>
                      </div>
                      <button className="ml-auto hidden rounded-full bg-main px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black group-hover:flex">
                        Play
                      </button>
                    </div>
                  ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-[16px] bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent activity</h3>
            <button className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
              Clear
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-[12px] border border-border-muted bg-background px-3 py-2"
                  >
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))
              : isAuthenticated && recentData?.items
                ? recentData.items.map((item, idx) => {
                    const track = item.track;
                    const artistNames = track.artists.map((a) => a.name).join(", ");
                    return (
                      <div
                        key={`${track.id}-${idx}`}
                        className="group flex cursor-pointer items-center justify-between rounded-[12px] border border-border-muted bg-background px-3 py-2 transition-all hover:border-border"
                        onClick={() => playTrack(track, idx)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{track.name}</p>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                            {artistNames} · {formatDuration(track.duration_ms)}
                          </p>
                        </div>
                        <span className="ml-3 shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-fg-subtle">
                          {timeAgo(item.played_at)}
                        </span>
                      </div>
                    );
                  })
                : FALLBACK_RECENT.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-[12px] border border-border-muted bg-background px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                          {item.subtitle}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-fg-subtle">
                        {item.time}
                      </span>
                    </div>
                  ))}
          </div>
        </div>
      </section>
    </MusicShell>
  );
};

export default LibraryPage;
