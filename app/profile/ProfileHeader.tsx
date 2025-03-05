"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  user: {
    avatar?: string;
    displayName?: string;
    username?: string;
    email: string;
  };
  totalWatching: number;
  totalPlanning: number;
  totalCompleted: number;
}

export default function ProfileHeader({ user, totalWatching, totalPlanning, totalCompleted }: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700/50"
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-800 shadow-lg border-2 border-indigo-500/30"
        >
          {user.avatar ? (
            <Image src={user.avatar} alt={user.displayName || "User"} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-4xl font-bold">
              {(user.displayName || user.email).charAt(0).toUpperCase()}
            </div>
          )}
        </motion.div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {user.displayName || user.username || user.email.split('@')[0]}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{user.email}</p>
          <div className="mt-4 flex flex-col md:flex-row justify-center md:justify-start gap-3">
            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Edit Profile
            </Link>
            <Link
              href="/profile/settings"
              className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full text-white text-sm font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-6 grid grid-cols-3 gap-4"
      >
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm p-4 rounded-xl text-center border border-indigo-500/20 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-xl font-bold text-white">{totalWatching}</div>
          <div className="text-gray-400 text-xs">Watching</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm p-4 rounded-xl text-center border border-indigo-500/20 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-xl font-bold text-white">{totalPlanning}</div>
          <div className="text-gray-400 text-xs">Planning</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm p-4 rounded-xl text-center border border-indigo-500/20 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-xl font-bold text-white">{totalCompleted}</div>
          <div className="text-gray-400 text-xs">Completed</div>
        </div>
      </motion.div>
    </motion.div>
  );
}