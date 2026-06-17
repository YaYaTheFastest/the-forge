import type { Metadata } from 'next';
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
        {children}
        <FloatingGrokButton />
      </body>
    </html>
  );
}
