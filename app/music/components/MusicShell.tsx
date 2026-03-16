"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/app/components/theme-toggle";

interface MusicShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  headerActions?: React.ReactNode;
  rightRail?: React.ReactNode;
  footer?: React.ReactNode;
}

const MusicShell: React.FC<MusicShellProps> = ({
  title,
  subtitle,
  children,
  showSearch = true,
  searchQuery,
  onSearchChange,
  headerActions,
  rightRail,
  footer,
}) => {
  const pathname = usePathname();
  const searchInputProps = onSearchChange
    ? { value: searchQuery ?? "", onChange: (event: React.ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value) }
    : {};

  return (
    <div className="spotify-shell min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside className="hidden w-[280px] flex-col gap-3 border-r border-border-muted bg-bg-secondary p-4 lg:flex">
          <Link href="/music" className="flex items-center gap-3 rounded-[12px] bg-surface px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border-muted bg-main text-black">
              <MusicNoteIcon size={18} />
            </span>
            <span className="text-lg font-bold tracking-tight">neo<span className="text-main">beats</span></span>
          </Link>

          <div className="space-y-1 rounded-[12px] bg-surface p-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive ? "bg-surface-hover text-foreground" : "text-fg-subtle hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-1 flex-col rounded-[12px] bg-surface p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-fg-subtle">Your Library</span>
              <button className="rounded-full border border-border-muted px-2 py-0.5 text-xs font-bold text-fg-subtle">
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pb-3">
              {["Playlists", "Artists", "Albums"].map((chip) => (
                <span key={chip} className="rounded-full border border-border-muted bg-surface-hover px-3 py-1 text-[11px] font-semibold text-fg-subtle">
                  {chip}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border-muted bg-background px-3 py-2">
              <SearchIcon />
              <input
                className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-fg-subtle"
                placeholder="Search in Library"
              />
            </div>
            <div className="mt-4 space-y-2 overflow-y-auto pr-1">
              {["Daily Mix 1", "Late Night Code", "Focus Mode", "Neon City", "Workout Raw"].map((pl) => (
                <div key={pl} className="flex items-center gap-3 rounded-[10px] p-2 hover:bg-surface-hover">
                  <span className="h-10 w-10 rounded-[8px] bg-gradient-to-br from-main to-bg-secondary" />
                  <div>
                    <p className="text-sm font-semibold">{pl}</p>
                    <p className="text-[11px] text-fg-subtle">Playlist · 40 songs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border-muted bg-background/80 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <button className="hidden rounded-full border border-border-muted bg-surface px-3 py-1 text-xs font-semibold text-fg-subtle md:inline">
                  {subtitle ?? "Listening now"}
                </button>
                <h1 className="text-xl font-bold tracking-tight">{title}</h1>
              </div>
              {showSearch && (
                <div className="hidden flex-1 items-center justify-center px-6 lg:flex">
                  <div className="flex w-full max-w-lg items-center gap-2.5 rounded-full border border-border-muted bg-background px-4 py-2">
                    <SearchIcon />
                    <input
                      type="text"
                      placeholder="Search Spotify tracks..."
                      className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-fg-subtle"
                      {...searchInputProps}
                    />
                    <span className="hidden rounded-full border border-border-muted px-2 py-0.5 font-mono text-[10px] text-fg-subtle lg:block">/</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                {headerActions}
                <ThemeToggle />
                <Link
                  href="/music/profile"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border-muted bg-surface text-xs font-bold text-foreground"
                  aria-label="Open profile"
                >
                  NB
                </Link>
              </div>
            </div>
          </header>

          <div className="flex flex-1 gap-6 px-4 pb-24 pt-6 md:px-6">
            <main className="w-full flex-1">{children}</main>
            <aside className="sticky top-24 hidden h-[calc(100vh-140px)] w-[320px] shrink-0 flex-col gap-4 rounded-[16px] border border-border-muted bg-surface p-4 xl:flex">
              {rightRail ?? (
                <>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-fg-subtle">Now Playing</p>
                    <h3 className="mt-2 text-lg font-bold">Neo Beats Weekly</h3>
                    <p className="text-sm text-fg-subtle">Curated for your current mood</p>
                  </div>
                  <div className="rounded-[14px] border border-border-muted bg-background p-3">
                    <div className="h-40 w-full rounded-[10px] bg-gradient-to-br from-main to-bg-secondary" />
                    <div className="mt-3">
                      <p className="text-sm font-bold">Brutal Sunrise</p>
                      <p className="text-xs text-fg-subtle">Echo Chamber</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button className="rounded-full bg-main px-4 py-1 text-xs font-bold text-black">Play</button>
                      <button className="rounded-full border border-border-muted px-4 py-1 text-xs font-bold text-fg-subtle">Queue</button>
                    </div>
                  </div>
                  <div className="rounded-[14px] border border-border-muted bg-background p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-fg-subtle">Up next</p>
                    <div className="mt-3 space-y-2">
                      {["Pixel Heart", "Mono Chrome", "Offset Dream"].map((track) => (
                        <div key={track} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{track}</p>
                            <p className="text-[11px] text-fg-subtle">3:20</p>
                          </div>
                          <span className="text-[10px] font-semibold text-fg-subtle">+2m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </div>

      {footer}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-muted bg-background lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-1 rounded-[12px] px-2 py-2 text-[10px] font-semibold ${
                  isActive ? "text-foreground" : "text-fg-subtle"
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-hover">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MusicShell;

const MusicNoteIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const HomeIcon: React.FC = () => (
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
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

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

const LibraryIcon: React.FC = () => (
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
    <path d="m16 6 4 14" />
    <path d="M12 6v14" />
    <path d="M8 8v12" />
    <path d="M4 4v16" />
  </svg>
);

const RadioIcon: React.FC = () => (
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
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
  </svg>
);

const UserIcon: React.FC = () => (
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
    <path d="M19 21a7 7 0 0 0-14 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/music", icon: <HomeIcon /> },
  { label: "Search", href: "/music/search", icon: <SearchIcon /> },
  { label: "Library", href: "/music/library", icon: <LibraryIcon /> },
  { label: "Radio", href: "/music/radio", icon: <RadioIcon /> },
  { label: "Profile", href: "/music/profile", icon: <UserIcon /> },
];
