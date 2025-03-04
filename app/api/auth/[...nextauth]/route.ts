// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "../../../../lib/db";
import { User } from "../../../../lib/models/User";
import bcrypt from "bcryptjs";

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("Warning: NEXTAUTH_SECRET is not defined. This is unsafe and not recommended!");
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            return null;
          }
          
          // Use direct bcrypt comparison
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            return null;
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || user.email.split('@')[0],
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // Explicitly configure JWT
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  // JWT and session configuration
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  // Make sure to use the environment variable
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };