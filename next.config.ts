import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/shop/",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/product/:slug",
        destination: "/products/:slug",
        permanent: true,
      },
      {
        source: "/product/:slug/",
        destination: "/products/:slug",
        permanent: true,
      },
      {
        source: "/cart",
        destination: "/checkout",
        permanent: false,
      },
      {
        source: "/cart/",
        destination: "/checkout",
        permanent: false,
      },
    ];
  },
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
