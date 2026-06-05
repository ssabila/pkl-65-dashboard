import { DM_Sans, Lora } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const garetBold = localFont({
  src: [
    {
      path: "../public/fonts/Garet-Heavy.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-garet-heavy",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Dashboard Big Data PKL 65",
  description: "Dashboard untuk manajemen 8 modul analisis big data",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${garetBold.variable} ${lora.variable} ${dmSans.variable} h-full antialiased bg-background`}
    >
      <body className="min-h-full flex flex-col text-foreground">{children}</body>
    </html>
  );
}
