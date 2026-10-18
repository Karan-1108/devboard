/** @type {import('next').NextConfig} */
const apiBaseUrl = (
  process.env.API_INTERNAL_URL || "http://localhost:4000"
).replace(/\/$/, "");

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;