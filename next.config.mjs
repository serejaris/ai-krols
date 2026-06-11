/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 1200, 1920],
    imageSizes: [50, 150, 500],
    dangerouslyAllowSVG: false,
    unoptimized: false,
    // Character art is served from CDN in deployments where the 1.5GB
    // of PNGs is not bundled (see NEXT_PUBLIC_IMG_BASE)
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' }
    ]
  },
  // Thumbs and art are content-addressed by token id and never change —
  // without this Next serves public/ files with max-age=0 and every repeat
  // visit revalidates all 1189 tiles.
  async headers() {
    return [
      {
        source: '/thumbs/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/img/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ];
  }
};

export default nextConfig;
