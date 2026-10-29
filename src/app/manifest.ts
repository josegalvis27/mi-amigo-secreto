import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mi Amigo Secreto",
    short_name: "Amigo Secreto",
    description: "El amigo secreto navideño de tus amigos",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f24",
    theme_color: "#0a0f24",
    lang: "es",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
