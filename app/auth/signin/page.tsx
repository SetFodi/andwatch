"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function SignIn() {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    if (res?.ok) router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl mb-4">Sign In to AndWatch</h1>
        <input name="email" type="email" placeholder="Email" className="block w-full p-2 mb-4 bg-gray-700 rounded" />
        <input name="password" type="password" placeholder="Password" className="block w-full p-2 mb-4 bg-gray-700 rounded" />
        <button type="submit" className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700">Sign In</button>
      </form>
    </div>
  );
}