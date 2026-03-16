"use client";

import React from "react";
import MusicShell from "@/app/music/components/MusicShell";

const PROFILE_STATS = [
  { label: "Followers", value: "12.4k" },
  { label: "Following", value: "184" },
  { label: "Playlists", value: "24" },
  { label: "Minutes", value: "48k" },
];

const TOP_GENRES = [
  { label: "Synthwave", color: "bg-purple-300" },
  { label: "Lo-fi", color: "bg-yellow-300" },
  { label: "Indie Rock", color: "bg-pink-300" },
  { label: "Ambient", color: "bg-cyan-300" },
];

const RECENT_PLAYS = [
  { title: "Pixel Heart", artist: "Neon Flux", time: "5m ago" },
  { title: "Brutal Sunrise", artist: "Echo Chamber", time: "18m ago" },
  { title: "Focus Mode", artist: "Playlist", time: "1h ago" },
  { title: "Static Waves", artist: "Live Radio", time: "3h ago" },
];

const ProfilePage: React.FC = () => {
  return (
    <MusicShell title="Profile" subtitle="Your personal sound identity">
      <section className="rounded-[18px] bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-[14px] border border-border-muted bg-main text-2xl font-bold text-black">
              NB
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
                Listener Profile
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
                Nguyen Beats
              </h2>
              <p className="mt-1 text-sm font-medium text-fg-subtle">
                Building focus playlists since 2020 · Ho Chi Minh City
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full bg-main px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black">
              Edit profile
            </button>
            <button className="rounded-full border border-border-muted bg-background px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
              Share
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROFILE_STATS.map((stat) => (
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
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[16px] bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Top genres</h3>
            <button className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
              View report
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TOP_GENRES.map((genre) => (
              <div
                key={genre.label}
                className="flex items-center justify-between rounded-[14px] border border-border-muted bg-background p-3"
              >
                <div>
                  <p className="text-sm font-bold">{genre.label}</p>
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fg-subtle">
                    12 playlists
                  </p>
                </div>
                <span
                  className={`h-10 w-10 rounded-[10px] border border-border-muted ${genre.color}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[16px] bg-surface p-5">
          <h3 className="text-lg font-bold">Recent plays</h3>
          <div className="mt-4 space-y-3">
            {RECENT_PLAYS.map((play) => (
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
          <button className="mt-4 w-full rounded-full border border-border-muted bg-background px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">
            See full history
          </button>
        </div>
      </section>
    </MusicShell>
  );
};

export default ProfilePage;
