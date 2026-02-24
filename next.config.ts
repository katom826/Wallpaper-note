import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/wallpaper-note",
  assetPrefix: "/wallpaper-note/",
  trailingSlash: true,
  // i18n: {
  //   locales: ["ja"],
  //   defaultLocale: "ja",
  // }
};

export default nextConfig;
