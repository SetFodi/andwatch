// app/about/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("about");
  
  // Fade-in animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" 
      }
    }
  };
  
  // Staggered children animations
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        {/* Background with animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl animate-blob"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">
                and
              </span>
              <span className="text-white">watch</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your all-in-one platform for tracking, rating, and discovering anime, movies, and TV shows
            </p>
            
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link href="/anime" className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-lg shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:scale-105">
                Explore Anime
              </Link>
              <Link href="/movies" className="px-8 py-3 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 hover:border-indigo-500/50 text-white font-medium text-lg shadow-lg hover:shadow-gray-900/30 transition-all duration-300 transform hover:scale-105">
                Discover Movies
              </Link>
              <Link href="/tvshows" className="px-8 py-3 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 hover:border-indigo-500/50 text-white font-medium text-lg shadow-lg hover:shadow-gray-900/30 transition-all duration-300 transform hover:scale-105">
                Browse TV Shows
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-gray-900/80 border-t border-b border-gray-800/50 py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto hide-scrollbar py-3 gap-6">
            <button 
              onClick={() => setActiveTab("about")} 
              className={`px-4 py-2 rounded-lg text-lg font-medium whitespace-nowrap transition-colors ${activeTab === "about" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              About
            </button>
            <button 
              onClick={() => setActiveTab("features")} 
              className={`px-4 py-2 rounded-lg text-lg font-medium whitespace-nowrap transition-colors ${activeTab === "features" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Features
            </button>
            <button 
              onClick={() => setActiveTab("ratings")} 
              className={`px-4 py-2 rounded-lg text-lg font-medium whitespace-nowrap transition-colors ${activeTab === "ratings" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Rating System
            </button>
            <button 
              onClick={() => setActiveTab("faq")} 
              className={`px-4 py-2 rounded-lg text-lg font-medium whitespace-nowrap transition-colors ${activeTab === "faq" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              FAQ
            </button>
            <button 
              onClick={() => setActiveTab("contact")} 
              className={`px-4 py-2 rounded-lg text-lg font-medium whitespace-nowrap transition-colors ${activeTab === "contact" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Contact
            </button>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AnimatedTabPanel isActive={activeTab === "about"}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={container}
            >
              <motion.h2 variants={fadeIn} className="text-3xl font-bold mb-6">What is AndWatch?</motion.h2>
              <motion.p variants={fadeIn} className="text-gray-300 text-lg mb-6">
                AndWatch is your ultimate companion for tracking and discovering anime, movies, and TV shows. We've created a beautiful, user-friendly platform that helps enthusiasts organize, rate, and explore the content they love.
              </motion.p>
              <motion.p variants={fadeIn} className="text-gray-400 mb-6">
                Our mission is to create the most comprehensive yet simple-to-use tracking tool for all video media enthusiasts. Whether you're a casual viewer or a dedicated fan, AndWatch helps you keep track of what you're watching, what you've completed, and what's next on your list.
              </motion.p>
              <motion.p variants={fadeIn} className="text-gray-400">
                With extensive databases for anime from MyAnimeList, movies and TV shows from The Movie Database, and social features to share your thoughts, AndWatch is the all-in-one platform for your entertainment tracking needs.
              </motion.p>
            </motion.div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl transform rotate-3 blur-sm"></div>
              <div className="bg-gray-900/90 border border-gray-800/70 rounded-2xl p-8 backdrop-blur-sm relative z-10">
                <h3 className="text-xl font-semibold mb-6 text-purple-300">Why AndWatch?</h3>
                <ul className="space-y-4">
                  <FeatureItem icon={<CheckIcon />} text="Track your watching progress across anime, movies, and TV shows" />
                  <FeatureItem icon={<CheckIcon />} text="Organize content with customizable watchlists" />
                  <FeatureItem icon={<CheckIcon />} text="Rate and review your favorite titles" />
                  <FeatureItem icon={<CheckIcon />} text="Discover new content based on your preferences" />
                  <FeatureItem icon={<CheckIcon />} text="Beautiful, responsive interface optimized for all devices" />
                  <FeatureItem icon={<CheckIcon />} text="Privacy-focused approach with your data" />
                </ul>
              </div>
            </div>
          </div>
          
          {/* User Stats */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-10 text-center">Growing Community</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard icon={<UsersIcon />} value="15,000+" label="Active Users" />
              <StatCard icon={<FilmIcon />} value="300,000+" label="Movies Tracked" />
              <StatCard icon={<TvIcon />} value="120,000+" label="TV Episodes Tracked" />
              <StatCard icon={<StarIcon />} value="1.5M+" label="Ratings Created" />
            </div>
          </div>
        </AnimatedTabPanel>
        
        <AnimatedTabPanel isActive={activeTab === "features"}>
          <h2 className="text-3xl font-bold mb-12 text-center">
            Powerful Features for Media Enthusiasts
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<TrackIcon />}
              title="Advanced Tracking"
              description="Keep track of what you're watching, planning to watch, and have completed. Never lose your place with episode tracking."
            />
            <FeatureCard 
              icon={<RateIcon />}
              title="Rate & Review"
              description="Express your thoughts with our 10-point rating system and write detailed reviews to share your opinions."
            />
            <FeatureCard 
              icon={<DiscoverIcon />}
              title="Discovery"
              description="Find new content based on genres, popularity, and recommendations tailored to your taste."
            />
            <FeatureCard 
              icon={<ProfileIcon />}
              title="Customizable Profile"
              description="Show off your media journey with a personalized profile displaying your stats and favorites."
            />
            <FeatureCard 
              icon={<SearchIcon />}
              title="Powerful Search"
              description="Find exactly what you're looking for with our comprehensive search across all media types."
            />
            <FeatureCard 
              icon={<ResponsiveIcon />}
              title="Responsive Design"
              description="Enjoy a seamless experience across all your devices, from desktop to mobile."
            />
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-xl text-gray-300 mb-8">Ready to experience these features?</p>
            <div className="flex justify-center space-x-6">
              <Link href="/auth/signup" className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-lg shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:scale-105">
                Sign Up Now
              </Link>
              <Link href="/anime" className="px-8 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500/50 text-white font-medium text-lg transition-all duration-300 transform hover:scale-105">
                Explore Content
              </Link>
            </div>
          </div>
        </AnimatedTabPanel>
        
        <AnimatedTabPanel isActive={activeTab === "ratings"}>
          <h2 className="text-3xl font-bold mb-8 text-center">
            Understanding Our Rating System
          </h2>
          
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center mb-12">
            AndWatch uses ratings from different sources to provide you with the most accurate information about anime, movies, and TV shows.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <RatingSourceCard 
              badgeColor="bg-indigo-900/60 border-indigo-800/50 text-indigo-300"
              type="Anime"
              source="MyAnimeList (MAL)"
              description="Scores from the popular anime community site MyAnimeList, ranging from 1-10."
              details="These ratings reflect the average score given by thousands of anime fans, making them a reliable source for anime quality assessment."
            />
            
            <RatingSourceCard 
              badgeColor="bg-red-900/60 border-red-800/50 text-red-300"
              type="Movies"
              source="The Movie Database (TMDB)"
              description="Ratings from The Movie Database community, ranging from 0-10."
              details="TMDB ratings are contributed by movie enthusiasts around the world. They may differ from other popular rating sites like IMDb or Rotten Tomatoes."
            />
            
            <RatingSourceCard 
              badgeColor="bg-blue-900/60 border-blue-800/50 text-blue-300"
              type="TV Shows"
              source="The Movie Database (TMDB)"
              description="Ratings from The Movie Database community, ranging from 0-10."
              details="Similar to movies, TV show ratings come from TMDB's global community of television fans."
            />
          </div>
          
          <div className="mt-12 bg-gray-900/60 rounded-xl p-8 border border-gray-800/50">
            <h3 className="text-xl font-semibold mb-4">Your Own Ratings</h3>
            <p className="text-gray-300 mb-6">
              Beyond our sourced ratings, AndWatch lets you rate any content on a scale of 1-10. Your personal ratings are kept separate from the external source ratings, allowing you to develop your own taste profile.
            </p>
            <div className="flex items-center space-x-1 justify-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <div key={num} className={`w-8 h-8 flex items-center justify-center rounded-md ${num > 6 ? 'bg-gradient-to-br from-yellow-600 to-amber-500 text-white' : num > 3 ? 'bg-gradient-to-br from-blue-600 to-indigo-500 text-white' : 'bg-gradient-to-br from-gray-700 to-gray-600 text-white'}`}>
                  {num}
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm text-center mt-4">
              Our 10-point rating system lets you express your opinion with precision.
            </p>
          </div>
        </AnimatedTabPanel>
        
        <AnimatedTabPanel isActive={activeTab === "faq"}>
          <h2 className="text-3xl font-bold mb-10 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto divide-y divide-gray-800/50">
            <FaqItem 
              question="Is AndWatch completely free to use?"
              answer="Yes! AndWatch is completely free to use with all core features available to everyone. We may introduce premium features in the future, but the core tracking and rating functionality will always remain free."
            />
            <FaqItem 
              question="Where does AndWatch get its content information from?"
              answer="We source anime data from the Jikan API (unofficial MyAnimeList API) and movies/TV shows from The Movie Database (TMDB). This gives us a comprehensive database with detailed information about titles, episodes, cast, and more."
            />
            <FaqItem 
              question="How can I add a show or movie that's missing from the database?"
              answer="Currently, we rely on our data providers for content. If you notice something missing, it's likely because it hasn't been added to MyAnimeList or TMDB yet. Once it appears in these sources, it will automatically be available on AndWatch."
            />
            <FaqItem 
              question="Can I import my watchlist from other services?"
              answer="We're working on import functionality from popular services like MyAnimeList, AniList, Trakt, and IMDb. This feature will be available in a future update."
            />
            <FaqItem 
              question="How do I track my watching progress?"
              answer="When viewing any title, click the 'Add to Watchlist' button and select your watch status (Planning, Watching, or Completed). For series, you can update your episode progress directly from your profile or the title page."
            />
            <FaqItem 
              question="What's the difference between the various ratings shown?"
              answer="External ratings (labeled as MAL or TMDB) come from their respective sources and show the average community rating. Your personal rating is separate and only visible to you (and on your profile if you choose to make it public)."
            />
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-300 mb-4">Still have questions?</p>
            <button 
              onClick={() => setActiveTab("contact")}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-500 hover:to-purple-500 text-white font-medium transition-all duration-300"
            >
              Contact Us
            </button>
          </div>
        </AnimatedTabPanel>
        
        <AnimatedTabPanel isActive={activeTab === "contact"}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Get In Touch</h2>
            
            <p className="text-lg text-gray-300 text-center mb-10">
              Have questions, suggestions, or feedback? We'd love to hear from you!
            </p>
            
            <div className="bg-gray-900/60 rounded-xl p-8 border border-gray-800/50">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <MailIcon className="w-5 h-5 text-indigo-400 mt-1 mr-3" />
                      <div>
                        <p className="text-white font-medium">Email</p>
                        <a href="mailto:lukafartenadze@gmail.com" className="text-gray-400 hover:text-indigo-400 transition-colors">
                          lukafartenadze@gmail.com
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <GithubIcon className="w-5 h-5 text-indigo-400 mt-1 mr-3" />
                      <div>
                        <p className="text-white font-medium">GitHub</p>
                        <a href="https://github.com/SetFodi" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition-colors">
                          github.com/SetFodi
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <InstagramIcon className="w-5 h-5 text-indigo-400 mt-1 mr-3" />
                      <div>
                        <p className="text-white font-medium">Instagram</p>
                        <a href="https://www.instagram.com/fartenadzeluka" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition-colors">
                          @fartenadzeluka
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="md:w-1/2">
                  <h3 className="text-xl font-semibold mb-4">About the Creator</h3>
                  <p className="text-gray-300 mb-4">
                    AndWatch was built by Luka Fartenadze, a passionate developer and anime/movie enthusiast who wanted to create the ultimate tracking platform.
                  </p>
                  <p className="text-gray-400">
                    The platform was developed using Next.js, React, and MongoDB, with a focus on performance, usability, and beautiful design.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-800/50 text-center">
                <p className="text-gray-300 mb-4">Found a bug or have a feature request?</p>
                <a 
                  href="https://github.com/SetFodi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                >
                  <GithubIcon className="w-5 h-5 mr-2" />
                  Submit on GitHub
                </a>
              </div>
            </div>
          </div>
        </AnimatedTabPanel>
      </div>
      
      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-t border-gray-800/50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Watching Journey?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of users who are already tracking, rating, and discovering new content on AndWatch.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/auth/signup" className="px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105">
              Create an Account
            </Link>
            <Link href="/anime" className="px-10 py-4 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 hover:border-indigo-500/50 text-white font-medium text-lg shadow-lg hover:shadow-gray-900/30 transition-all duration-300 transform hover:scale-105">
              Explore Content
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} AndWatch — Built with ❤️ by Luka Fartenadze
          </p>
        </div>
      </footer>
    </div>
  );
}

// Animated Tab Panel Component
function AnimatedTabPanel({ children, isActive }) {
  return (
    <div className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 hidden'}`}>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

// Feature Item Component
function FeatureItem({ icon, text }) {
  return (
    <li className="flex items-start">
      <span className="text-indigo-400 mr-3 mt-0.5">{icon}</span>
      <span className="text-gray-300">{text}</span>
    </li>
  );
}

// Stat Card Component
function StatCard({ icon, value, label }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6 text-center shadow-xl"
    >
      <div className="text-indigo-400 flex justify-center mb-4">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6 shadow-xl"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600/30 to-purple-600/30 text-indigo-400 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}

// Rating Source Card Component
function RatingSourceCard({ badgeColor, type, source, description, details }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6 shadow-xl"
    >
      <div className={`inline-block px-3 py-1 rounded-lg text-sm font-medium mb-4 ${badgeColor}`}>
        {type}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{source}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <p className="text-gray-400 text-sm">{details}</p>
    </motion.div>
  );
}

// FAQ Item Component
function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="py-5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center text-left focus:outline-none"
      >
        <h3 className="text-lg font-medium text-white">{question}</h3>
        <span className={`ml-6 flex-shrink-0 text-indigo-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>
      <div className={`mt-2 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-400">{answer}</p>
      </div>
    </div>
  );
}

// Icons Components
function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function FilmIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

function TvIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function TrackIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function RateIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ResponsiveIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function GithubIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}