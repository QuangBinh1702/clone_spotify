"use client";

import React from "react";
import Image from "next/image";
import MusicShell from "@/app/music/components/MusicShell";
import { useMusicContext } from "@/app/music/context";
import {
  useProfile,
  useTopArtists,
  useTopTracks,
  useRecentlyPlayed,
  usePlaylists,
} from "@/app/lib/hooks";
import { getImageUrl, formatDuration } from "@/app/lib/spotify";

/* ─── Helpers ─── */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const GENRE_COLORS = [
  "bg-purple-300",
  "bg-yellow-300",
  "bg-pink-300",
  "bg-cyan-300",
  "bg-green-300",
  "bg-orange-300",
  "bg-red-300",
  "bg-amber-300",
];

/* ─── Skeleton ─── */

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-[5px] bg-border-muted ${className}`}
  />
);

/* ─── Fallback data ─── */

const FALLBACK_STATS = [
  { label: "Playlists", value: "24" },
  { label: "Top Artists", value: "12" },
  { label: "Recent Tracks", value: "8" },
];

const FALLBACK_GENRES = [
  { label: "Synthwave", color: "bg-purple-300" },
  { label: "Lo-fi", color: "bg-yellow-300" },
  { label: "Indie Rock", color: "bg-pink-300" },
  { label: "Ambient", color: "bg-cyan-300" },
];

const FALLBACK_RECENT = [
  { title: "Pixel Heart", artist: "Neon Flux", time: "5m ago" },
  { title: "Brutal Sunrise", artist: "Echo Chamber", time: "18m ago" },
  { title: "Focus Mode", artist: "Playlist", time: "1h ago" },
  { title: "Static Waves", artist: "Live Radio", time: "3h ago" },
];

/* ─── Page ─── */

const ProfilePage: React.FC = () => {
  const { isAuthenticated, login, logout, playTrack } = useMusicContext();

  const { data: profile, loading: profileLoading } = useProfile();
  const { data: topArtists, loading: artistsLoading } = useTopArtists();
  const { data: topTracks, loading: tracksLoading } = useTopTracks("medium_term");
  const { data: recentlyPlayed, loading: recentLoading } = useRecentlyPlayed();
  const { data: playlists, loading: playlistsLoading } = usePlaylists();

  const loading = profileLoading || artistsLoading || tracksLoading || recentLoading || playlistsLoading;

  /* Derived data */
  const displayName =
    isAuthenticated && profile?.display_name
      ? profile.display_name
      : "Nguyen Beats";

  const profileImageUrl =
    isAuthenticated && profile ? getImageUrl(profile.images, "large") : null;

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const genres: { label: string; color: string }[] =
    isAuthenticated && topArtists?.items
      ? Array.from(
          new Set(
            topArtists.items.flatMap((a) => a.genres ?? [])
          )
        )
          .slice(0, 8)
          .map((g, i) => ({
            label: g,
            color: GENRE_COLORS[i % GENRE_COLORS.length],
          }))
      : FALLBACK_GENRES;

  const stats = isAuthenticated
    ? [
        { label: "Playlists", value: "—" },
        {
          label: "Top Artists",
          value: String(topArtists?.items?.length ?? 0),
        },
        {
          label: "Recent Tracks",
          value: String(recentlyPlayed?.items?.length ?? 0),
        },
      ]
    : FALLBACK_STATS;

  return (
    <MusicShell title="Profile" subtitle="Your personal sound identity">
      {/* ── Profile header ── */}
      <section className="rounded-[18px] bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {isAuthenticated && loading ? (
            <div className="flex items-center gap-5">
              <Skeleton className="h-20 w-20 rounded-[14px]" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-[14px] border border-border-muted object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-[14px] border border-border-muted bg-main text-2xl font-bold text-black">
                  {initials}
                </div>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
                  Listener Profile
                </p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
                  {displayName}
                </h2>
                {!isAuthenticated && (
                  <p className="mt-1 text-sm font-medium text-fg-subtle">
                    Building focus playlists since 2020 · Ho Chi Minh City
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="rounded-full border border-border-muted bg-background px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={login}
                className="rounded-full bg-main px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black"
              >
                Connect Spotify
              </button>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        {isAuthenticated && loading ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-[14px] border border-border-muted bg-background p-4"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-2 rounded-[14px] border border-border-muted bg-background p-4"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Genres + Recent plays ── */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Top genres */}
        <div className="rounded-[16px] bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Top genres</h3>
          </div>
          {isAuthenticated && artistsLoading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-[14px]" />
              ))}
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {genres.map((genre) => (
                <div
                  key={genre.label}
                  className="flex items-center justify-between rounded-[14px] border border-border-muted bg-background p-3"
                >
                  <p className="text-sm font-bold capitalize">{genre.label}</p>
                  <span
                    className={`h-10 w-10 rounded-[10px] border border-border-muted ${genre.color}`}
                  />
                </div>
              ))}
              {genres.length === 0 && (
                <p className="col-span-2 text-sm text-fg-subtle">
                  No genre data available yet.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recent plays */}
        <div className="rounded-[16px] bg-surface p-5">
          <h3 className="text-lg font-bold">Recent plays</h3>
          {isAuthenticated && recentLoading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-[12px]" />
              ))}
            </div>
          ) : isAuthenticated && recentlyPlayed?.items ? (
            <div className="mt-4 space-y-3">
              {recentlyPlayed.items.slice(0, 8).map((item, idx) => (
                <button
                  key={`${item.track.id}-${item.played_at}`}
                  onClick={() => playTrack(item.track, idx)}
                  className="flex w-full items-center justify-between rounded-[12px] border border-border-muted bg-background px-3 py-2 text-left transition-colors hover:bg-border-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {item.track.name}
                    </p>
                    <p className="truncate text-[11px] font-medium uppercase tracking-[0.2em] text-fg-subtle">
                      {item.track.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-fg-subtle">
                      {timeAgo(item.played_at)}
                    </span>
                    <span className="text-[10px] font-medium text-fg-subtle">
                      {formatDuration(item.track.duration_ms)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {FALLBACK_RECENT.map((play) => (
                <div
                  key={play.title}
                  className="flex items-center justify-between rounded-[12px] border border-border-muted bg-background px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-bold">{play.title}</p>
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fg-subtle">
                      {play.artist}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-fg-subtle">
                    {play.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </MusicShell>
  );
};

export default ProfilePage;
