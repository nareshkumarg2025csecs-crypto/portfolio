/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rsrldfurryoaeadfevkd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/portfolio-assets/**',
      },
    ],
  },
};

export default nextConfig;
