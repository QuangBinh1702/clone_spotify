"use client";

import React from "react";
import Image from "next/image";
import MusicShell from "@/app/music/components/MusicShell";
import { useMusicContext } from "@/app/music/context";
import { useTopArtists, useRecommendations } from "@/app/lib/hooks";
import { getImageUrl, formatDuration } from "@/app/lib/spotify";

const LIVE_STATIONS = [
  { name: "Neo FM", host: "Live from Tokyo", listeners: "12.4k", color: "bg-purple-300" },
  { name: "Static Waves", host: "Analog to Digital", listeners: "8.1k", color: "bg-cyan-300" },
  { name: "Beats Lab", host: "Producer Spotlight", listeners: "5.9k", color: "bg-yellow-300" },
];

const FOR_YOU = [
  { title: "Late Night Coding", subtitle: "Lo-fi · 2h mix", color: "bg-green-300" },
  { title: "Neon City Drive", subtitle: "Synthwave · 1h 20m", color: "bg-pink-300" },
  { title: "Brutal Bass", subtitle: "EDM · 48m", color: "bg-red-300" },
  { title: "Jazz Workspace", subtitle: "Smooth · 2h 12m", color: "bg-orange-300" },
];

const TOPICS = [
  "Morning Focus",
  "High Energy",
  "Late Night",
  "Chillhop",
  "Indie Radio",
  "Retro Mix",
  "Instrumental",
  "Ambient",
];

const ARTIST_COLORS = [
  "bg-yellow-300", "bg-pink-300", "bg-green-300", "bg-purple-300",
  "bg-orange-300", "bg-cyan-300", "bg-red-300", "bg-amber-300",
];

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-[5px] bg-border-muted ${className}`} />
);

const RadioPage: React.FC = () => {
  const { isAuthenticated, login } = useMusicContext();
  const { data: topArtists, loading: artistsLoading } = useTopArtists();
  const seedArtists = topArtists?.items?.slice(0, 4).map((artist) => artist.id) ?? [];
  const { data: recommendations, loading: recLoading } = useRecommendations(seedArtists);

  const personalizedStations = topArtists?.items?.slice(0, 4).map((artist, i) => ({
    id: artist.id,
    title: `Radio based on ${artist.name}`,
    subtitle: artist.genres?.slice(0, 2).join(" · ") || "Personalized mix",
    imageUrl: getImageUrl(artist.images, "small"),
    color: ARTIST_COLORS[i % ARTIST_COLORS.length],
  })) ?? [];

  return (
    <MusicShell title="Radio" subtitle="Live stations & curated waves">
      <section className="rounded-[18px] bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-fg-subtle">
              Live Broadcast
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Feel the pulse of the airwaves.
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium text-fg-subtle">
              Jump into live sets, curated stations, and community broadcasts
              made for your current mood.
            </p>
          </div>
          <button className="rounded-full bg-main px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black">
            Start Listening
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {LIVE_STATIONS.map((station) => (
            <div
              key={station.name}
              className="group rounded-[14px] border border-border-muted bg-background p-4 transition-all hover:border-border"
            >
              <div
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] border border-border-muted ${station.color} text-xs font-bold text-black`}
              >
                LIVE
              </div>
              <h3 className="text-sm font-bold">{station.name}</h3>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                {station.host}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-fg-subtle">
                  {station.listeners} listeners
                </span>
                <button className="rounded-full bg-main px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                  Tune in
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[16px] bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Made for you</h3>
            <button className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
              Refresh
            </button>
          </div>

          {isAuthenticated ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {artistsLoading || recLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-[14px] border border-border-muted bg-background p-3"
                    >
                      <Skeleton className="h-12 w-12 rounded-[10px]" />
                      <div className="flex-1">
                        <Skeleton className="mb-1.5 h-3.5 w-3/4" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                  ))
                : recommendations?.tracks?.length
                  ? recommendations.tracks.slice(0, 4).map((track, idx) => (
                      <div
                        key={track.id}
                        className="group flex items-center gap-3 rounded-[14px] border border-border-muted bg-background p-3 transition-all hover:border-border"
                      >
                        {getImageUrl(track.album.images, "small") ? (
                          <Image
                            src={getImageUrl(track.album.images, "small")!}
                            alt={track.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-[10px] border border-border-muted object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-[10px] border border-border-muted ${ARTIST_COLORS[idx % ARTIST_COLORS.length]} text-xs font-bold text-black`}
                          >
                            MIX
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold">{track.name}</p>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                            {track.artists.map((a) => a.name).join(", ")} ?? {formatDuration(track.duration_ms)}
                          </p>
                        </div>
                        <button className="ml-auto hidden rounded-full bg-main px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black group-hover:flex">
                          Play
                        </button>
                      </div>
                    ))
                  : personalizedStations.map((station) => (
                      <div
                        key={station.id}
                        className="group flex items-center gap-3 rounded-[14px] border border-border-muted bg-background p-3 transition-all hover:border-border"
                      >
                        {station.imageUrl ? (
                          <Image
                            src={station.imageUrl}
                            alt={station.title}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-[10px] border border-border-muted object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-[10px] border border-border-muted ${station.color} text-xs font-bold text-black`}
                          >
                            MIX
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold">{station.title}</p>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                            {station.subtitle}
                          </p>
                        </div>
                        <button className="ml-auto hidden rounded-full bg-main px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black group-hover:flex">
                          Play
                        </button>
                      </div>
                    ))}
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {FOR_YOU.map((station) => (
                  <div
                    key={station.title}
                    className="group flex items-center gap-3 rounded-[14px] border border-border-muted bg-background p-3 transition-all hover:border-border"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-[10px] border border-border-muted ${station.color} text-xs font-bold text-black`}
                    >
                      MIX
                    </div>
                    <div>
                      <p className="text-sm font-bold">{station.title}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                        {station.subtitle}
                      </p>
                    </div>
                    <button className="ml-auto hidden rounded-full bg-main px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black group-hover:flex">
                      Play
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={login}
                className="mt-4 w-full rounded-full border border-border-muted bg-main px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-main/80"
              >
                Connect Spotify to unlock personalized radio
              </button>
            </>
          )}
        </div>

        <div className="rounded-[16px] bg-surface p-5">
          <h3 className="text-lg font-bold">Topics</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {TOPICS.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-border-muted bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle"
              >
                {topic}
              </span>
            ))}
          </div>
          <div className="mt-6 border-t border-border-muted pt-4 text-sm font-medium text-fg-subtle">
            Keep listening to fine-tune your radio recommendations.
          </div>
        </div>
      </section>
    </MusicShell>
  );
};

export default RadioPage;
