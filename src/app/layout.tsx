import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/layout/providers";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ledger of Sumer",
  description: "Turn every invoice into a perfect record.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen overflow-hidden bg-background`}
      >
        <Providers>
          <SidebarProvider>
            <AppSidebar />
            <div className="flex w-full flex-col relative overflow-hidden">
              <Header />
              {children}
            </div>
          </SidebarProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
