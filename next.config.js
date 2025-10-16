/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If you ever switch to <Image />, allow your remote images here:
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  },
  // Helpful for cleaner prod builds
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  }
};

module.exports = nextConfig;
