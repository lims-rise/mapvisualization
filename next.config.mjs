// /** @type {import('next').NextConfig} */
// const nextConfig = {};


// export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     reactStrictMode: false,  // Disable React Strict Mode
//     experimental: {
//       reactRefresh: false, // Optionally disable Fast Refresh for testing purposes
//     },
//   };
  
//   export default nextConfig;
  
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     // Cek pengaturan lainnya di sini
//     reactStrictMode: false,
//     // experimental: {
//     //     turbopack: false,
//     //   },
//   };
  
//   export default nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Disarankan untuk pengembangan dan produksi
  swcMinify: true, // Untuk optimasi build
  experimental: {
    appDir: true, // Aktifkan penggunaan struktur `src/app`
  },
};

export default nextConfig;

  