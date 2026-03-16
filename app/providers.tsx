"use client";

import React, { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider, signIn, useSession } from "next-auth/react";

const SessionErrorWatcher: React.FC = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.error === "RefreshTokenError" || session?.error === "NoRefreshToken") {
      signIn("spotify", { callbackUrl: "/music" });
    }
  }, [session?.error, status]);

  return null;
};

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SessionErrorWatcher />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
};

export default Providers;
