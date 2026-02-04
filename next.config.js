
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['anviksha-medical-s3.s3.ap-south-1.amazonaws.com'], // Secure S3 bucket
    },
    // Pillar 1: PWA / Offline-First Optimization
    experimental: {
        serverActions: true,
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
        ];
    },
    // Pillar 1: Edge Routing for Diagnostic Core
    async rewrites() {
        return [
            {
                source: '/api/diagnostic/:path*',
                destination: '/api/edge/:path*', // Route to Edge Middleware
            },
        ];
    },
};

module.exports = nextConfig;
