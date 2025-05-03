# IPTV/OTT Platform

A modern IPTV/OTT platform built with Next.js, TypeScript, and Tailwind CSS. This application provides a Netflix-like interface for streaming live TV channels, movies, and series from Xtream Codes IPTV providers.

## Features

- **Modern UI**: Netflix-inspired interface with smooth animations using Framer Motion
- **Content Types**: Support for Live TV, Movies, and Series
- **Authentication**: Login with Xtream Codes credentials
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Dark Mode**: Built-in dark mode support
- **Performance Optimized**: Virtual scrolling for large content lists
- **Video Playback**: HLS streaming support with advanced player controls

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Mode

The application includes a mock API for development purposes. When running in development mode, the application will use mock data instead of making real API calls to an Xtream Codes server.

To test the mock API, run:

```bash
node test-mock-api.js
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# TMDB API (for enhanced movie/series metadata)
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_TMDB_ACCESS_TOKEN=your_tmdb_access_token

# Development mode (set to true to use mock data)
NEXT_PUBLIC_USE_MOCK_API=true
```

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/app/api` - API routes for proxying requests and mock data
- `/app/components` - UI components
- `/app/hooks` - Custom React hooks
- `/app/lib` - Utility functions, API services, and types
- `/app/store` - Zustand state management

## Recent Updates

- Added API proxy to handle CORS issues with Xtream API
- Implemented mock API for development and testing
- Fixed content display issues in grid components
- Improved error handling in API requests
- Enhanced authentication with persistent sessions
- Added stream request handling for live TV, movies, and series

## Technologies Used

- Next.js 15.3.1 with App Router
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- Zustand for state management
- HLS.js for video streaming
- Axios for API requests
- ShadCN UI components

## License

MIT
