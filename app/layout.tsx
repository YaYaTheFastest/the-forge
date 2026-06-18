import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import FloatingGrokButton from './components/FloatingGrokButton';

export const metadata: Metadata = {
  title: 'The Forge | The Mat',
  description: 'BJJ Techniques, Equipment Maintenance, Fitness & Daily Wins',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight text-lg flex items-center gap-2">
              🔥 The Forge
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium">
              <Link href="/mat" className="hover:text-emerald-600 transition-colors">The Mat</Link>
              <Link href="/techniques" className="hover:text-emerald-600 transition-colors">Techniques</Link>
              <Link href="/fitness" className="hover:text-emerald-600 transition-colors">Fitness</Link>
              <Link href="/forge" className="hover:text-emerald-600 transition-colors">Forge</Link>
              <Link href="/domains" className="hover:text-emerald-600 transition-colors">Domains</Link>
              <Link href="/shop" className="hover:text-emerald-600 transition-colors">Shop</Link>
              <Link href="/status" className="hover:text-emerald-600 transition-colors">Status</Link>
            </nav>
            <div className="text-xs text-muted-foreground hidden sm:block">
              rockinjracing.com
            </div>
          </div>
        </header>
        {children}
        <FloatingGrokButton />
      </body>
    </html>
  );
}
