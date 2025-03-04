// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
  
  /**
   * Extending the built-in user types
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extending the built-in JWT types
   */
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    picture?: string | null;
  }
}