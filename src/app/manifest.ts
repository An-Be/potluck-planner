import type { MetadataRoute } from "next";
import { site } from "@/config/site";

// Icons: the pot mark. SVG for browsers that take it, PNGs for home screens,
// and a maskable one with extra padding so Android's shape crop keeps the pot.
// Regenerate the PNGs from src/app/icon.svg if the mark changes.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    // No start_url: it then defaults to the page the person added to their Home
    // Screen from, so party pages (/p/<slug>) open themselves.
    display: "standalone",
    background_color: site.themeColor,
    theme_color: site.themeColor,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
