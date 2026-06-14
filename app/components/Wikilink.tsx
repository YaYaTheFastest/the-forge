'use client';

import Link from 'next/link';

interface WikilinkProps {
  children: React.ReactNode;
  href?: string;
}

// This component handles Obsidian-style [[links]] inside ReactMarkdown
export function Wikilink({ children, href }: WikilinkProps) {
  if (!href) return <>{children}</>;

  // If it's an internal technique link (starts with /techniques or is a slug-like string)
  if (href.startsWith('/techniques') || !href.includes('://')) {
    return (
      <Link 
        href={href} 
        className="text-blue-600 hover:underline font-medium"
      >
        {children}
      </Link>
    );
  }

  // External link
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  );
}
