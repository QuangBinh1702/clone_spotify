import NextAuth from "next-auth";
import Spotify from "next-auth/providers/spotify";

const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-top-read",
  "user-library-read",
  "playlist-read-private",
  "playlist-read-collaborative",
].join(" ");


export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Spotify({
      clientId: process.env.AUTH_SPOTIFY_ID,
      clientSecret: process.env.AUTH_SPOTIFY_SECRET,
      checks: ["state"],
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope: SPOTIFY_SCOPES,
        },
      },

    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      try {
        const target = new URL(url);
        const base = new URL(baseUrl);
        const isLocalhostPair =
          (target.origin === "http://localhost:3000" &&
            base.origin === "http://127.0.0.1:3000") ||
            (target.origin === "http://localhost:3000" &&
              base.origin === "https://4q1fxqtg-3000.asse.devtunnels.ms") ||
          (target.origin === "http://127.0.0.1:3000" &&
            base.origin === "http://localhost:3000");

        if (target.origin === base.origin || isLocalhostPair) {
          return target.toString();
        }
      } catch {
        // Fallback to a safe local page below.
      }

      return `${baseUrl}/music`;
    },
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at as number | undefined,
          refresh_token: account.refresh_token as string | undefined,
        };
      }

      if (
        token.expires_at &&
        typeof token.expires_at === "number" &&
        Date.now() < token.expires_at * 1000
      ) {
        return token;
      }

      try {
        if (!token.refresh_token) {
          return { ...token, error: "NoRefreshToken" };
        }

        const basic = Buffer.from(
          `${process.env.AUTH_SPOTIFY_ID}:${process.env.AUTH_SPOTIFY_SECRET}`
        ).toString("base64");

        const refreshToken =
          typeof token.refresh_token === "string" ? token.refresh_token : "";
        const res = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
        });

        const newTokens = await res.json();

        if (!res.ok) throw newTokens;

        return {
          ...token,
          access_token: newTokens.access_token,
          expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
          refresh_token: newTokens.refresh_token ?? token.refresh_token,
        };
      } catch {
        return { ...token, error: "RefreshTokenError" };
      }
    },
    async session({ session, token }) {
      session.access_token = token.access_token;
      session.error = token.error;
      if (session.user) {
        (session.user as typeof session.user & { access_token?: string }).access_token =
          token.access_token;
      }
      return session;
    },
  },
});
