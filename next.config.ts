import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = isGithubPages
  ? {
      // Static export for GitHub Pages: no Node runtime, no route handlers, no image optimizer.
      output: "export",
      basePath,
      assetPrefix: basePath,
      images: { unoptimized: true },
    }
  : {
      output: "standalone",
    };

export default nextConfig;
