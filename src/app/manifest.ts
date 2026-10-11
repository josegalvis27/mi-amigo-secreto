import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mi Amigo Secreto",
    short_name: "Amigo Secreto",
    description: "El amigo secreto navideño de tus panas",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f24",
    theme_color: "#0a0f24",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
