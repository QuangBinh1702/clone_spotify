"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useMusicContext, TRACK_COLORS, FALLBACK_TRACKS } from "@/app/music/context";
import { formatDuration, getImageUrl } from "@/app/lib/spotify";

/* ─── Icons ─── */

const PlayIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="6,3 20,12 6,21" />
  </svg>
);

const PauseIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
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

const MusicNoteIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const VolumeIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const MicIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
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

/* ─── Player Bar Component ─── */

const PlayerBar: React.FC = () => {
  const {
    isPlaying, togglePlay, nextTrack, prevTrack,
    isAuthenticated, currentTrack, currentFallbackTrack,
    currentTime, duration, volume,
    isShuffle, repeatMode,
    toggleLike, toggleShuffle, cycleRepeat, setVolume, seekTo,
    likedTracks,
    effectiveTracks,
    embedUri,
  } = useMusicContext();

  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const trackTitle = isAuthenticated && currentTrack ? currentTrack.name : currentFallbackTrack.title;
  const trackArtist = isAuthenticated && currentTrack
    ? currentTrack.artists.map((a) => a.name).join(", ")
    : currentFallbackTrack.artist;
  const trackDuration = isAuthenticated && currentTrack
    ? formatDuration(currentTrack.duration_ms)
    : currentFallbackTrack.duration;
  const playbackDuration = duration > 0 ? duration : (isAuthenticated && currentTrack ? currentTrack.duration_ms / 1000 : 0);
  const progress = playbackDuration > 0 ? Math.min(1, currentTime / playbackDuration) : 0;
  const progressPercent = `${Math.round(progress * 100)}%`;
  const trackColor = isAuthenticated && currentTrack
    ? TRACK_COLORS[currentTrack.name.charCodeAt(0) % TRACK_COLORS.length]
    : currentFallbackTrack.color;
  const albumImage = isAuthenticated && currentTrack
    ? getImageUrl(currentTrack.album.images, "small")
    : null;

  const isLiked = currentTrack?.id ? likedTracks.has(currentTrack.id) : false;

  const queueItems = useMemo(() => {
    if (effectiveTracks.length > 0) {
      return Array.from({ length: Math.min(5, effectiveTracks.length) }).map((_, idx) => {
        const queueIndex = (idx + 1) % effectiveTracks.length;
        const item = effectiveTracks[queueIndex];
        return {
          id: item.id,
          title: item.name,
          artist: item.artists.map((a) => a.name).join(", "),
          duration: formatDuration(item.duration_ms),
        };
      });
    }

    return FALLBACK_TRACKS.slice(0, 5).map((item) => ({
      id: String(item.id),
      title: item.title,
      artist: item.artist,
      duration: item.duration,
    }));
  }, [effectiveTracks]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-[2px] border-border-muted bg-background lg:bottom-0">
      {embedUri && (
        <div className="border-b border-border-muted bg-background/95 px-4 py-3 shadow-brutal-sm backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-main">Spotify Player</p>
              <p className="text-sm font-semibold text-foreground">If preview is unavailable, use this embed.</p>
            </div>
            <div className="w-full max-w-xl overflow-hidden rounded-[10px] border border-border-muted">
              <iframe
                src={`https://open.spotify.com/embed/${embedUri.replace("spotify:", "").replace(/:/g, "/")}?utm_source=generator&theme=0`}
                width="100%"
                height="80"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="border-0"
                title="Spotify Player"
              />
            </div>
          </div>
        </div>
      )}
      <div className="absolute -top-[2px] left-0 h-[2px] w-full">
        <div className="h-full bg-main transition-all" style={{ width: progressPercent }} />
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-2 md:px-6">
        {/* Track Info */}
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border-[2px] border-black ${trackColor} shadow-brutal-sm ${isPlaying ? "animate-[spin_8s_linear_infinite]" : ""}`}>
            {albumImage ? (
              <Image src={albumImage} alt={trackTitle} className="h-full w-full object-cover" width={48} height={48} />
            ) : (
              <MusicNoteIcon size={16} />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{trackTitle}</p>
            <p className="truncate text-[11px] font-medium text-fg-subtle">{trackArtist}</p>
          </div>
          <button
            onClick={() => currentTrack?.id && toggleLike(currentTrack.id)}
            className={`ml-2 hidden cursor-pointer transition-colors sm:block ${isLiked ? "text-pink-400" : "text-fg-subtle hover:text-pink-400"}`}
            aria-label="Like"
          >
            <HeartIcon filled={isLiked} />
          </button>
        </div>

        {/* Center controls */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`hidden cursor-pointer transition-colors sm:block ${isShuffle ? "text-foreground" : "text-fg-subtle hover:text-foreground"}`}
              aria-label="Shuffle"
            >
              <ShuffleIcon />
            </button>
            <button onClick={prevTrack} className="cursor-pointer text-fg-muted transition-colors hover:text-foreground" aria-label="Previous">
              <SkipBackIcon />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[5px] border-[2px] border-black bg-main text-black shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={nextTrack} className="cursor-pointer text-fg-muted transition-colors hover:text-foreground" aria-label="Next">
              <SkipForwardIcon />
            </button>
            <button
              onClick={cycleRepeat}
              className={`hidden cursor-pointer transition-colors sm:block ${repeatMode === "off" ? "text-fg-subtle hover:text-foreground" : "text-foreground"}`}
              aria-label="Repeat"
            >
              <RepeatIcon />
            </button>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <span className="w-8 text-right font-mono text-[10px] tabular-nums text-fg-subtle">
              {formatDuration(Math.floor(currentTime * 1000))}
            </span>
            <div
              className="group relative h-1 w-48 cursor-pointer rounded-full bg-border-muted lg:w-96"
              onClick={(event) => {
                const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
                const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
                if (playbackDuration > 0) seekTo(ratio * playbackDuration);
              }}
            >
              <div className="h-full rounded-full bg-main transition-all" style={{ width: progressPercent }} />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2px] border-main bg-white opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: progressPercent }}
              />
            </div>
            <span className="w-8 font-mono text-[10px] tabular-nums text-fg-subtle">{trackDuration}</span>
          </div>
        </div>

        {/* Right: Volume + extras */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => { setShowLyrics((v) => !v); setShowQueue(false); }}
            className={`cursor-pointer transition-colors ${showLyrics ? "text-main" : "text-fg-subtle hover:text-foreground"}`}
            aria-label="Lyrics"
          >
            <MicIcon />
          </button>
          <button
            onClick={() => { setShowQueue((v) => !v); setShowLyrics(false); }}
            className={`cursor-pointer transition-colors ${showQueue ? "text-main" : "text-fg-subtle hover:text-foreground"}`}
            aria-label="Queue"
          >
            <ListIcon />
          </button>
          <div className="mx-1 h-4 w-px bg-border-muted" />
          <button className="cursor-pointer text-fg-subtle transition-colors hover:text-foreground" aria-label="Volume">
            <VolumeIcon />
          </button>
          <div
            className="group relative h-1 w-24 cursor-pointer rounded-full bg-border-muted"
            onClick={(event) => {
              const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
              const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
              setVolume(ratio);
            }}
          >
            <div className="h-full rounded-full bg-fg-muted transition-colors group-hover:bg-main" style={{ width: `${Math.round(volume * 100)}%` }} />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
              style={{ left: `${Math.round(volume * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Floating panels for lyrics and queue */}
      {(showLyrics || showQueue) && (
        <div className="pointer-events-none absolute bottom-16 right-4 z-[60] flex max-w-md flex-col gap-3">
          {showLyrics && (
            <div className="pointer-events-auto rounded-[10px] border-[2px] border-black bg-surface p-4 shadow-brutal-sm">
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-fg-subtle">
                <span>Lyrics</span>
                <button
                  onClick={() => setShowLyrics(false)}
                  className="rounded-[5px] border border-border-muted px-2 py-1 text-[10px] font-semibold text-fg-muted hover:border-border"
                  aria-label="Close lyrics"
                >
                  Close
                </button>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {trackTitle}
              </p>
              <p className="text-[11px] font-medium text-fg-subtle mb-3">
                {trackArtist}
              </p>
              <p className="text-xs leading-relaxed text-fg-subtle">
                Lyrics are not available for 30s previews. Use the Spotify player above for full lyrics when available.
              </p>
            </div>
          )}

          {showQueue && (
            <div className="pointer-events-auto rounded-[10px] border-[2px] border-black bg-surface p-4 shadow-brutal-sm">
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-fg-subtle">
                <span>Queue</span>
                <button
                  onClick={() => setShowQueue(false)}
                  className="rounded-[5px] border border-border-muted px-2 py-1 text-[10px] font-semibold text-fg-muted hover:border-border"
                  aria-label="Close queue"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                {queueItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-[6px] border border-border-muted bg-background px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="truncate text-[11px] font-medium text-fg-subtle">{item.artist}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-mono text-fg-subtle">{item.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerBar;
