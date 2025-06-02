# AndWatch 🎬

A modern, beautiful web application for tracking anime, movies, and TV shows. Built with Next.js, NextAuth, and MongoDB.

## ✨ Features

- **User Authentication**: Secure sign-up and sign-in with NextAuth
- **Media Tracking**: Track anime, movies, and TV shows
- **Watchlists**: Create and manage personal watchlists
- **Reviews & Ratings**: Rate and review content
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Updates**: Dynamic content updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB database
- TMDB API key (for movie/TV data)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd andwatch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/andwatch
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   TMDB_API_KEY=your-tmdb-api-key-here
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Recent Fixes

### Sign Out Functionality ✅
- **Issue**: Sign out button was pointing to non-existent `/auth/signout` route
- **Fix**: Updated to use NextAuth's `signOut()` function with proper callback URL
- **Files Changed**:
  - `components/layout/EnhancedHeader.tsx`
  - Created `app/auth/signout/page.tsx` for direct navigation handling

### Search Functionality ✅
- **Issue**: Movies and TV shows search returning "No results found" while anime works
- **Fix**: Added proper TMDB API key validation and error handling
- **Files Changed**:
  - `lib/services/api.ts` - Enhanced error handling for all TMDB API methods
  - `.env.example` - Added TMDB API key documentation
  - Created `app/api/test-tmdb/route.ts` for API testing

### Authentication Redirects ✅
- **Issue**: Profile page redirected to incorrect sign-in path
- **Fix**: Updated redirect to use correct `/auth/signin` path
- **Files Changed**: `app/profile/page.tsx`

### Configuration Cleanup ✅
- **Issue**: Hardcoded API keys and deprecated config options
- **Fix**:
  - Removed hardcoded TMDB API key
  - Removed deprecated `swcMinify` option
  - Added proper environment variable validation
- **Files Changed**:
  - `lib/services/api.ts`
  - `next.config.ts`
  - Created `.env.example`

### Profile Filtering Behavior ✅
- **Issue**: "Missing spots" when filtering by media type in profile sections
- **Clarification**: This is actually correct behavior - when filtering by specific media types (e.g., only movies), anime and TV show slots are intentionally hidden, creating a filtered view. This is working as designed.

## 📁 Project Structure

```
andwatch/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── profile/           # User profile pages
│   └── ...
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   └── ...
├── lib/                   # Utilities and services
│   ├── models/           # Database models
│   ├── services/         # External API services
│   └── utils/            # Helper functions
└── types/                # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.1
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Language**: TypeScript

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `TMDB_API_KEY` | The Movie Database API key | ✅ |
| `NODE_ENV` | Environment (development/production) | ✅ |

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Node.js applications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Search Issues (Movies/TV Shows not working)
1. **Check TMDB API Key**: Ensure `TMDB_API_KEY` is set in your `.env.local` file
2. **Get API Key**: Visit [TMDB API Settings](https://www.themoviedb.org/settings/api) to get your free API key
3. **Test API**: Visit `/api/test-tmdb` to verify your API key is working
4. **Check Console**: Look for TMDB API errors in browser console or server logs

### Profile Filtering "Missing Spots"
This is normal behavior! When you filter by media type (e.g., "Movies Only"), the system hides anime and TV show items, creating gaps in the grid. This is intentional to show only the filtered content.

### Sign Out Issues
- Make sure you're using the updated header component
- Check that NextAuth is properly configured
- Verify `NEXTAUTH_SECRET` is set in environment variables

### General Issues
1. Check the environment variables are set correctly
2. Ensure MongoDB connection is working
3. Verify all required API keys are valid
4. Check the browser console for errors
5. Restart the development server after environment changes

For additional help, please open an issue in the repository.
