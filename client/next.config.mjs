/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // указ.допустим.хостинг > next/Image
    // domains: ["lh3.googleusercontent.com"], // стар.способ
    // от ошб. "images.domains configuration
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Замените на домен ваших изображений
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
