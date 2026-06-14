'use client';

import Link from 'next/link';

interface TechniqueLinkProps {
  children: React.ReactNode;
  href: string;
}

export function TechniqueLink({ children, href }: TechniqueLinkProps) {
  // Convert Obsidian [[link]] style to our slug
  // For now, we assume the link text can be used to generate a rough slug or we pass the actual slug.
  // In practice, we'll parse [[Exact Name]] in the markdown processor.

  return (
    <Link 
      href={href} 
      className="text-blue-600 hover:underline font-medium"
    >
      {children}
    </Link>
  );
}
