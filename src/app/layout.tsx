import type { Metadata, Viewport } from "next";
import { Fredoka, Mountains_of_Christmas, Caveat } from "next/font/google";
import Snow from "@/components/Snow";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const xmas = Mountains_of_Christmas({
  variable: "--font-xmas",
  subsets: ["latin"],
  weight: ["400", "700"],
});
const hand = Caveat({ variable: "--font-hand", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mi Amigo Secreto 🎁",
  description: "Arma tu amigo secreto navideño con tus amigos: sorteo, lista de deseos y mucha emoción.",
  appleWebApp: { capable: true, title: "Mi Amigo Secreto", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0a0f24",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${xmas.variable} ${hand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Snow />
        <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
