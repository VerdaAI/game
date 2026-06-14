import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const urbanist = localFont({
  src: [
    { path: "../../public/fonts/Urbanist-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Urbanist-Medium.ttf", weight: "500" },
    { path: "../../public/fonts/Urbanist-SemiBold.ttf", weight: "600" },
    { path: "../../public/fonts/Urbanist-Bold.ttf", weight: "700" },
  ],
  variable: "--font-display",
  display: "swap",
});

const hostGrotesk = localFont({
  src: [
    { path: "../../public/fonts/HostGrotesk-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/HostGrotesk-SemiBold.ttf", weight: "600" },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Protect or Pirate | Verda",
  description:
    "Can you steal content without getting caught? Play the watermark game and find out.",
  openGraph: {
    title: "Protect or Pirate | Verda",
    description:
      "Can you steal content without getting caught? Play the watermark game and find out.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${urbanist.variable} ${hostGrotesk.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
