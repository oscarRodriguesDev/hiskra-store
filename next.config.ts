import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "dummyimage.com",
      },
      // Imagens de produtos do Mercado Livre
      {
        protocol: "https",
        hostname: "http2.mlstatic.com",
      },
      {
        protocol: "https",
        hostname: "http.mlstatic.com",
      },
      {
        protocol: "https",
        hostname: "mlstatic.com",
      },
    ],
  },
};

export default nextConfig;
