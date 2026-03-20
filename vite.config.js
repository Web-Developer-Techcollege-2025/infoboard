import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    proxy: {
      "/kantineapi": {
        target: "https://infoskaerm.techcollege.dk",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kantineapi/, ""),
        headers: {
          Referer: "https://infoskaerm.techcollege.dk/",
          Origin: "https://infoskaerm.techcollege.dk",
        },
      },
    },
  },
});
