import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "../../../../lib/db";
import { User } from "../../../../lib/models/User";
import bcrypt from "bcryptjs";

// Warn if NEXTAUTH_SECRET is not set
if (!process.env.NEXTAUTH_SECRET) {
  console.warn("Warning: NEXTAUTH_SECRET is not defined. This is unsafe and not recommended!");
}

// Auth options for NextAuth
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
          console.log("Missing credentials:", credentials);
          return null;
        }
        try {
          await connectDB();
          const email = credentials.email.toLowerCase();
          const user = await User.findOne({ email });
          if (!user) {
            console.log(`No user found for email: ${email}`);
            return null;
          }
          console.log("User found:", { email: user.email, storedHash: user.password });
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("Password valid:", isValid, "Input:", credentials.password);
          if (!isValid) {
            console.log("Password mismatch for:", email);
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
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Let NextAuth handle the routing for both GET and POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
