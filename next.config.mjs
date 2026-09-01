/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * beforeFiles rewrites run BEFORE Next.js checks app/api/ route handlers.
   * This ensures all /api/* traffic goes to the Python FastAPI server (port 8000)
   * even though the old TypeScript route files still exist on disk.
   */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
