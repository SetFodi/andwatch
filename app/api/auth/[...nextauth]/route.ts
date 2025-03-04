import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = new MongoClient(process.env.MONGODB_URI!);
        try {
          await client.connect();
          const db = client.db("andwatch");
          const user = await db.collection("users").findOne({ email: credentials?.email });
          
          if (user && credentials?.password === user.password) { // Use bcrypt in production!
            return { id: user._id.toString(), email: user.email };
          }
          return null;
        } finally {
          await client.close();
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };