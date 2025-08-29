/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export - use SSR instead
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || "",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Disable static optimization for API routes
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Skip API routes during static generation
  generateBuildId: async () => {
    return "band-availability-system";
  },
};

module.exports = nextConfig;
