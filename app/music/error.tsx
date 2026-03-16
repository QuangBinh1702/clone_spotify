"use client";

import React, { useEffect } from "react";

const MusicError: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-[16px] border border-border-muted bg-surface p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-fg-subtle">
          Something went wrong
        </p>
        <h2 className="mt-2 text-2xl font-bold">We hit a Spotify glitch.</h2>
        <p className="mt-2 text-sm text-fg-subtle">
          Try again in a moment or reconnect your account.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-full border-[2px] border-black bg-main px-6 py-2 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default MusicError;
