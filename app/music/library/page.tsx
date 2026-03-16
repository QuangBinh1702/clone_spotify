"use client";

import React from "react";
import MusicShell from "@/app/music/components/MusicShell";

const LIBRARY_STATS = [
  { label: "Playlists", value: "24", color: "bg-yellow-300" },
  { label: "Liked Songs", value: "312", color: "bg-pink-300" },
  { label: "Artists", value: "86", color: "bg-cyan-300" },
  { label: "Albums", value: "41", color: "bg-green-300" },
];

const PLAYLISTS = [
  { name: "Chill Brutalism", tracks: 28, vibe: "Lo-fi · Focus", color: "bg-green-300" },
  { name: "Late Night Code", tracks: 64, vibe: "Synth · Ambient", color: "bg-purple-300" },
  { name: "Workout Raw", tracks: 35, vibe: "EDM · Energy", color: "bg-red-300" },
  { name: "Focus Mode", tracks: 51, vibe: "Instrumental", color: "bg-cyan-300" },
  { name: "Retro Waves", tracks: 42, vibe: "Analog · 90s", color: "bg-yellow-300" },
  { name: "Indie Bold", tracks: 37, vibe: "Indie · Alt", color: "bg-pink-300" },
];

const RECENT_ACTIVITY = [
  { title: "Pixel Heart", subtitle: "Neon Flux · 3:24", time: "2m ago" },
  { title: "Concrete Dreams", subtitle: "Echo Chamber · Album", time: "12m ago" },
  { title: "Discovery Weekly", subtitle: "Playlist · 30 tracks", time: "1h ago" },
  { title: "Brutal Sunrise", subtitle: "Echo Chamber · 3:06", time: "3h ago" },
];

const LibraryPage: React.FC = () => {
  return (
    <MusicShell title="Library" subtitle="Curate your collection">
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
            <button className="rounded-full bg-main px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black">
              New Playlist
            </button>
            <button className="rounded-full border border-border-muted bg-background px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
              Import
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LIBRARY_STATS.map((stat) => (
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

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-[16px] bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Pinned playlists</h3>
            <button className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
              Manage
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PLAYLISTS.map((playlist) => (
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

        <div className="rounded-[16px] bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent activity</h3>
            <button className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
              Clear
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {RECENT_ACTIVITY.map((item) => (
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
