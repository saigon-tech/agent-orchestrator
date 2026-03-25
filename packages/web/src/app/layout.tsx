import type { Metadata } from "next";
import { VT323, IBM_Plex_Mono } from "next/font/google";
import { getProjectName } from "@/lib/project-name";
import "./globals.css";

const vt323 = VT323({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
  weight: "400",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["300", "400", "500"],
});

export async function generateMetadata(): Promise<Metadata> {
  const projectName = getProjectName();
  return {
    title: {
      template: `%s | ${projectName}`,
      default: `ao | ${projectName}`,
    },
    description: "Dashboard for managing parallel AI coding agents",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${vt323.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
        {children}
      </body>
    </html>
  );
}
