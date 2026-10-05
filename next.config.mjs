/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false, // Prevents double mounting in dev for CodeMirror and terminal
  swcMinify: true,
};

export default nextConfig;
