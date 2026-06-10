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
  }
};

export default nextConfig;
