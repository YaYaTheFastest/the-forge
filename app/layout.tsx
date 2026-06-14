import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { DevRestartButton } from './components/DevRestartButton';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Mat",
  description: "Personal BJJ training platform — technique library, curriculum, routines, and mind maps powered by your Obsidian vault.",
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
};

const desktopNav = [
  { href: '/', label: 'Home' },
  { href: '/mat', label: 'The Mat' },           // BJJ Domain Hub (Techniques, Routines, Curriculum, Mind Maps live here)
  { href: '/forge', label: 'Forge' },            // Equipment, Daily Wins, Operations
  { href: '/fitness', label: 'Fitness' },
  // Future domains added here as the factory grows
];

const mobileNav = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/mat', label: 'Mat', icon: '🥋' },    // The Mat (BJJ)
  { href: '/forge', label: 'Forge', icon: '🔥' },
  { href: '/fitness', label: 'Fitness', icon: '💪' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground pb-16 md:pb-0">
        {/* Top bar - Desktop + iPad */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 md:px-6">
            <Link href="/" className="font-semibold tracking-tight text-xl">The Mat</Link>

            <nav className="hidden md:flex items-center gap-7 text-sm">
              {desktopNav.map((item) => (
                <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Connected to Vault</span>
              </div>

              {/* Dev-only server restart button — appears in development */}
              {process.env.NODE_ENV === 'development' && (
                <DevRestartButton variant="header" />
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6">
          {children}
        </main>

        {/* Bottom Navigation - iPhone optimized */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
          <div className="grid grid-cols-5 h-16">
            {mobileNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center text-xs active:bg-muted/50"
              >
                <span className="text-lg mb-0.5">{item.icon}</span>
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <footer className="hidden md:block border-t py-3 text-center text-[10px] text-muted-foreground">
          The Mat — Domain #1 • Access from iOS: Use your Mac’s local IP (e.g. 192.168.x.x:3000)
        </footer>

        {/* Floating dev-only restart button — available on every page in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="hidden md:block fixed bottom-6 right-6 z-[60]">
            <DevRestartButton variant="floating" />
          </div>
        )}
      </body>
    </html>
  );
}
