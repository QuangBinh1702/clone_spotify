"use client";

import React, { useState } from "react";
import MusicShell from "@/app/music/components/MusicShell";

const FILTERS = ["Tracks", "Artists", "Albums", "Podcasts"] as const;

const TOP_RESULTS = [
  { title: "Neon Flux", type: "Artist", meta: "2.1M listeners", color: "bg-yellow-300" },
  { title: "Concrete Dreams", type: "Album", meta: "Echo Chamber · 2026", color: "bg-pink-300" },
  { title: "Hard Edges Live", type: "Podcast", meta: "Weekly · 52 eps", color: "bg-cyan-300" },
  { title: "Pixel Heart", type: "Track", meta: "Neon Flux · 3:24", color: "bg-green-300" },
];

const RECENT_SEARCHES = ["Lo-Fi for focus", "90s synthwave", "Indie office", "Acoustic morning"];

const BROWSE_CATEGORIES = [
  { label: "Daily Mix", vibe: "Chill · Focus", color: "bg-purple-300" },
  { label: "Late Night Code", vibe: "Instrumental", color: "bg-cyan-300" },
  { label: "Viral Hits", vibe: "Trending", color: "bg-pink-300" },
  { label: "Workout Raw", vibe: "High Energy", color: "bg-orange-300" },
  { label: "Jazz Study", vibe: "Smooth", color: "bg-amber-300" },
  { label: "Retro Wave", vibe: "Analog", color: "bg-yellow-300" },
];

const SearchPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("Tracks");

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
              className="w-64 bg-transparent text-sm text-foreground outline-none placeholder:text-fg-subtle"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[16px] bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold">Top results</h3>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                    activeFilter === filter
                      ? "border-main bg-main text-black"
                      : "border-border-muted bg-background text-fg-subtle hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TOP_RESULTS.map((item) => (
              <div
                key={item.title}
                className="group flex items-center gap-3 rounded-[14px] border border-border-muted bg-background p-3 transition-all hover:border-border"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-[10px] border border-border-muted ${item.color} text-xs font-bold text-black`}
                >
                  {item.type.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                    {item.type} · {item.meta}
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
          <h3 className="text-lg font-bold">Recent searches</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {RECENT_SEARCHES.map((query) => (
              <span
                key={query}
                className="rounded-full border border-border-muted bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle"
              >
                {query}
              </span>
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
