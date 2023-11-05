import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import { SkeletonTheme } from "react-loading-skeleton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WUC Converter",
  description: "Real-time WUC value tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SkeletonTheme
          baseColor="#363636"
          highlightColor="#404040"
          borderRadius={0}
        >
          <main className="flex min-h-screen flex-col items-center justify-between mt-24">
            {children}
          </main>
        </SkeletonTheme>
      </body>
    </html>
  );
}
