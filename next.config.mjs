/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double mounting in dev for CodeMirror and terminal
  swcMinify: true,
};

export default nextConfig;
