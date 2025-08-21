import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

export default defineConfig({
  site: "https://astro-resume-theme.netlify.app",
  integrations: [
    tailwind(),
    icon(),
    mdx({
      include: ["src/content/**/*.mdx"],
      exclude: ["src/content/blogs/**/*.mdx"],
    }),
    sitemap({
      filter: (page) => !page.includes("/blogs/"),
    }),
    react(),
  ],
  vite: {
    build: {
      rollupOptions: {
        external: (id) => id.includes("/blogs/") || id.includes("/blog/"),
      },
    },
    server: {
      watch: {
        ignored: ["**/blogs/**", "**/blog/**"],
      },
    },
  },
});
