import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    cognitoGroups: string[];
    access_token: string;
    refreshToken: string;
    expires_in: number;
    idToken: string;
    exp: number;
    role: string;
    token_type: string;
  }

  interface Session {
    user: User & DefaultSession["user"];
    expires: string;
    error: string;
    expires_in: number;
    access_token: string;
    token_type: string;
    picture: string;
  }
}
