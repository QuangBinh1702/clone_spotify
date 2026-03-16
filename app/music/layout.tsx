"use client";

import React from "react";
import { MusicProvider } from "@/app/music/context";
import PlayerBar from "@/app/music/components/PlayerBar";

const MusicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MusicProvider>
      {children}
      <PlayerBar />
    </MusicProvider>
  );
};

export default MusicLayout;
