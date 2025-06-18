/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["mssql"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
