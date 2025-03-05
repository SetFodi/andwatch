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
  const userName = user.displayName || user.username || user.email.split('@')[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="overflow-hidden rounded-3xl"
    >
      {/* Header Background with Blur Effect */}
      <div className="relative h-40 md:h-52 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Profile Content */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800/50 rounded-3xl -mt-20 mx-4 p-6 shadow-2xl backdrop-blur-lg">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:items-start">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
              className="relative h-32 w-32 rounded-2xl overflow-hidden -mt-24 ring-4 ring-gray-950 shadow-2xl"
            >
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={userName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-500 to-violet-600 text-white text-4xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>
          </div>

          {/* User Info Section */}
          <div className="flex-1 text-center md:text-left mt-6 md:mt-0">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-gray-100">
                {userName}
              </h1>
              <p className="text-indigo-300/80 text-sm mt-1">{user.email}</p>
            </motion.div>

            {/* Action Buttons (Only Edit Profile) */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start"
            >
              <Link
                href="/profile/edit"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white text-sm font-medium hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 transform"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                 <p className="text-m text-white">Edit Profile</p> 
                </span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          <StatsCard
            value={totalWatching}
            label="Watching"
            color="from-blue-600 to-indigo-600"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            value={totalPlanning}
            label="Planning"
            color="from-purple-600 to-pink-600"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatsCard
            value={totalCompleted}
            label="Completed"
            color="from-emerald-600 to-teal-600"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

interface StatsCardProps {
  value: number;
  label: string;
  color: string;
  icon: React.ReactNode;
}

function StatsCard({ value, label, color, icon }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      className={`bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-700/40 shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-gray-400 text-xs font-medium">{label}</div>
        </div>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}