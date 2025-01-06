import NextAuth from "next-auth";

import type { NextAuthConfig, Session } from "next-auth";
import Google from "next-auth/providers/google";

export const config = {
  theme: {
    logo: "/images/icons/timewise-logo.svg",
  },
  debug: process.env.NODE_ENV === "development" || process.env.DEBUG === "true",
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          redirect_uri:
            process.env.NODE_ENV === "production"
              ? "https://timewise.space/api/auth/callback/google"
              : "http://localhost:3000/api/auth/callback/google",
        },
      },
    }),
  ],
  trustHost: true,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        try {
          const response = await fetch(
            `${process.env.API_BASE_URL}/api/v1/auth/callback`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                credentials: account.access_token,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error("Error saving token");
          }
          const data = await response.json();
          token.accessToken = data.access_token;
        } catch (error) {
          console.error("Failed to save token:", error);
        }

        return {
          ...token,
          access_token: token.accessToken,
          issued_at: Date.now(),
          expires_at: Date.now() + Number(account.expires_in) * 1000,
          refresh_token: account.refresh_token,
          idToken: account.id_token,
        };
      } else {
        return token;
      }
    },
    async session({ session, token, user }) {
      // This will be accessible in the client side using useSession hook
      // So becareful what you return here. Don't return sensitive data.
      // The auth() function should return jwt response but instead it returns
      // the session object. This is a bug in next-auth.
      // Follow this bug https://github.com/nextauthjs/next-auth/issues/9329
      //save token id when login google success
      session.user = token as any;
      return session;
    },
  },
} satisfies NextAuthConfig;

export interface EnrichedSession extends Session {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  accessTokenIssuedAt: number;
}

export const { handlers, auth, signIn, signOut } = NextAuth(config);
