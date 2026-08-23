import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/cart/:path*",
        headers: [
          {
            key: "Access-Control-Expose-Headers",
            value: "x-cart-token",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
