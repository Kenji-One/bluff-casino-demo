import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["superapi-products.s3-ap-southeast-1.amazonaws.com"],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
