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

const SITE = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
const DESCRIPTION = "Arma el amigo secreto navideño con tus amigos, la familia o la oficina: sorteo, carta de deseos y fotos con disfraz. Gratis y sin registro.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Mi Amigo Secreto 🎁", template: "%s · Mi Amigo Secreto" },
  description: DESCRIPTION,
  applicationName: "Mi Amigo Secreto",
  openGraph: { type: "website", locale: "es_419", siteName: "Mi Amigo Secreto", title: "Mi Amigo Secreto 🎁", description: DESCRIPTION },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "Mi Amigo Secreto", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
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
