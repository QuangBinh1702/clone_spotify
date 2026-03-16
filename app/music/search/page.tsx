"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import MusicShell from "@/app/music/components/MusicShell";
import { useSearchTyped } from "@/app/lib/hooks";
import { useMusicContext } from "@/app/music/context";
import { formatDuration, getImageUrl } from "@/app/lib/spotify";

const RECENT_SEARCHES = ["Lo-Fi for focus", "90s synthwave", "Indie office", "Acoustic morning"];

const BROWSE_CATEGORIES = [
  { label: "Daily Mix", vibe: "Chill · Focus", color: "bg-purple-300" },
  { label: "Late Night Code", vibe: "Instrumental", color: "bg-cyan-300" },
  { label: "Viral Hits", vibe: "Trending", color: "bg-pink-300" },
  { label: "Workout Raw", vibe: "High Energy", color: "bg-orange-300" },
  { label: "Jazz Study", vibe: "Smooth", color: "bg-amber-300" },
  { label: "Retro Wave", vibe: "Analog", color: "bg-yellow-300" },
];

const TRACK_COLORS = [
  "bg-yellow-300", "bg-pink-300", "bg-green-300", "bg-purple-300",
  "bg-orange-300", "bg-cyan-300", "bg-red-300", "bg-amber-300",
];

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-[5px] bg-border-muted ${className}`} />
);

const PlayIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="6,3 20,12 6,21" />
  </svg>
);

const SearchPage: React.FC = () => {
  const { isAuthenticated, login, playTrack } = useMusicContext();
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeType, setActiveType] = useState<"track" | "artist" | "album" | "show">("track");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setInputValue("");
    setDebouncedQuery("");
    const saved = localStorage.getItem("nb-search-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, 6));
      } catch {
        /* noop */
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(inputValue.trim()), 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: searchData, loading } = useSearchTyped(
    isAuthenticated ? debouncedQuery : "",
    activeType
  );
  const tracks = searchData?.tracks?.items ?? [];
  const artists = searchData?.artists?.items ?? [];
  const albums = searchData?.albums?.items ?? [];
  const shows = searchData?.shows?.items ?? [];
  const hasQuery = debouncedQuery.length > 0;
  const showResults = isAuthenticated && hasQuery;

  return (
    <MusicShell title="Search" subtitle="Find your next obsession">
      <section className="rounded-[18px] bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fg-subtle">
              Search
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Find your next obsession
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-fg-subtle">
              Search tracks, artists, albums, podcasts, and radio mixes in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border-muted bg-background px-4 py-2">
            <SearchIcon />
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = inputValue.trim();
                  if (!val) return;
                  setHistory((prev) => {
                    const next = [val, ...prev.filter((q) => q !== val)].slice(0, 6);
                    localStorage.setItem("nb-search-history", JSON.stringify(next));
                    return next;
                  });
                  setShowHistory(false);
                }
              }}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 120)}
              autoComplete="off"
              className="w-64 bg-transparent text-sm text-foreground outline-none placeholder:text-fg-subtle"
            />
          </div>
          {showHistory && history.length > 0 && (
            <div className="relative w-full max-w-xl">
              <div className="absolute left-0 right-0 top-2 z-30 overflow-hidden rounded-[10px] border border-border-muted bg-background shadow-lg">
                {history.map((item) => (
                  <button
                    key={item}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setInputValue(item);
                      setShowHistory(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover"
                  >
                    <span className="truncate">{item}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-fg-subtle">History</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {!isAuthenticated && hasQuery && (
        <section className="mt-6 rounded-[16px] bg-surface p-8 text-center">
          <p className="text-sm font-medium text-fg-subtle">
            Connect your Spotify account to search tracks.
          </p>
          <button
            onClick={login}
            className="mt-4 rounded-full border-[2px] border-black bg-main px-6 py-2 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            Connect Spotify
          </button>
        </section>
      )}

      {showResults && loading && (
        <section className="mt-6 rounded-[16px] bg-surface p-5">
          <Skeleton className="mb-4 h-6 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-2.5 md:px-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-10 w-10 rounded-[4px]" />
              <div className="min-w-0 flex-1">
                <Skeleton className="mb-1 h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="hidden h-3 w-28 lg:block" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </section>
      )}

      {showResults && !loading && (
        <section className="mt-6 rounded-[16px] bg-surface p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { label: "Tracks", value: "track" },
              { label: "Artists", value: "artist" },
              { label: "Albums", value: "album" },
              { label: "Podcasts", value: "show" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveType(tab.value as typeof activeType)}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                  activeType === tab.value
                    ? "border-border bg-main text-black"
                    : "border-border-muted bg-background text-fg-subtle hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h3 className="mb-3 text-lg font-bold">
            Results for &ldquo;{debouncedQuery}&rdquo;
          </h3>

          {activeType === "track" && (
            <div className="divide-y divide-border-muted">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="group flex cursor-pointer items-center gap-4 rounded-[5px] px-3 py-2.5 transition-all hover:bg-surface-hover md:px-4"
                onClick={() => playTrack(track, index)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    <span className="text-sm font-bold tabular-nums text-fg-subtle group-hover:hidden">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="hidden text-foreground group-hover:block">
                      <PlayIcon size={14} />
                    </span>
                  </div>

                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border-[2px] border-black shadow-brutal-sm md:h-11 md:w-11 ${TRACK_COLORS[index % TRACK_COLORS.length]}`}>
                    {getImageUrl(track.album.images, "small") ? (
                      <Image
                        src={getImageUrl(track.album.images, "small")!}
                        alt={track.album.name}
                        className="h-full w-full object-cover"
                        width={44}
                        height={44}
                      />
                    ) : (
                      <span className="text-xs font-bold text-black">???</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{track.name}</p>
                    <p className="truncate text-xs font-medium text-fg-muted">
                      {track.explicit && (
                        <span className="mr-1 inline-block rounded-[2px] bg-fg-subtle px-1 text-[9px] font-bold text-background">
                          E
                        </span>
                      )}
                      {track.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>

                  <span className="hidden truncate text-xs font-medium text-fg-subtle lg:block lg:w-36">
                    {track.album.name}
                  </span>

                  <span className="w-14 text-right font-mono text-xs text-fg-subtle">
                    {formatDuration(track.duration_ms)}
                  </span>
                </div>
              ))}
              {tracks.length === 0 && (
                <p className="py-6 text-center text-sm text-fg-subtle">
                  No tracks found for &ldquo;{debouncedQuery}&rdquo;.
                </p>
              )}
            </div>
          )}

          {activeType === "artist" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center gap-3 rounded-[12px] border border-border-muted bg-background p-3"
                >
                  {getImageUrl(artist.images, "small") ? (
                    <Image
                      src={getImageUrl(artist.images, "small")!}
                      alt={artist.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full border border-border-muted object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border-muted bg-main text-xs font-bold text-black">
                      {artist.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{artist.name}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                      Artist
                    </p>
                  </div>
                </div>
              ))}
              {artists.length === 0 && (
                <p className="col-span-full py-6 text-center text-sm text-fg-subtle">
                  No artists found for &ldquo;{debouncedQuery}&rdquo;.
                </p>
              )}
            </div>
          )}

          {activeType === "album" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album, index) => (
                <div
                  key={album.id}
                  className="flex items-center gap-3 rounded-[12px] border border-border-muted bg-background p-3"
                >
                  <div className={`h-12 w-12 overflow-hidden rounded-[8px] border border-border-muted ${TRACK_COLORS[index % TRACK_COLORS.length]}`}>
                    {getImageUrl(album.images, "small") ? (
                      <Image
                        src={getImageUrl(album.images, "small")!}
                        alt={album.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{album.name}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                      {album.artists?.map((a) => a.name).join(", ") ?? "Album"}
                    </p>
                  </div>
                </div>
              ))}
              {albums.length === 0 && (
                <p className="col-span-full py-6 text-center text-sm text-fg-subtle">
                  No albums found for &ldquo;{debouncedQuery}&rdquo;.
                </p>
              )}
            </div>
          )}

          {activeType === "show" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shows.map((show) => (
                <div
                  key={show.id}
                  className="flex items-center gap-3 rounded-[12px] border border-border-muted bg-background p-3"
                >
                  {getImageUrl(show.images, "small") ? (
                    <Image
                      src={getImageUrl(show.images, "small")!}
                      alt={show.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-[8px] border border-border-muted object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-[8px] border border-border-muted bg-main text-xs font-bold text-black">
                      POD
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{show.name}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                      {show.publisher}
                    </p>
                  </div>
                </div>
              ))}
              {shows.length === 0 && (
                <p className="col-span-full py-6 text-center text-sm text-fg-subtle">
                  No podcasts found for &ldquo;{debouncedQuery}&rdquo;.
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {!showResults && (
        <>
          <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[16px] bg-surface p-5">
              <h3 className="text-lg font-bold">Recent searches</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {RECENT_SEARCHES.map((query) => (
                  <button
                    key={query}
                    onClick={() => setInputValue(query)}
                    className="rounded-full border border-border-muted bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle transition-colors hover:text-foreground"
                  >
                    {query}
                  </button>
                ))}
              </div>
              <div className="mt-6 border-t border-border-muted pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
                  Suggested
                </p>
                <p className="mt-2 text-sm font-medium text-fg-subtle">
                  Based on your latest plays: ambient textures, synthwave, glitch hop.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[16px] bg-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Browse categories</h3>
              <button className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
                View all
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BROWSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  className="group flex items-center justify-between rounded-[14px] border border-border-muted bg-background p-4 text-left transition-all hover:border-border"
                >
                  <div>
                    <p className="text-sm font-bold">{cat.label}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                      {cat.vibe}
                    </p>
                  </div>
                  <span
                    className={`h-12 w-12 rounded-[10px] border border-border-muted ${cat.color}`}
                  />
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </MusicShell>
  );
};

export default SearchPage;

const SearchIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
