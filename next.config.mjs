import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disarankan untuk pengembangan dan produksi
  swcMinify: true, // Untuk optimasi build
  experimental: {
    appDir: true, // Aktifkan penggunaan struktur `src/app`
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;

