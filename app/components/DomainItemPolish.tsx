'use client';

import React from 'react';

interface DomainItemPolishProps {
  slug: string;
  name: string;
  file: string;
}

export default function DomainItemPolish({ slug, name, file }: DomainItemPolishProps) {
  const handlePolish = () => {
    const evt = new CustomEvent('open-hermes-chat', {
      detail: { 
        message: `Polish and standardize this content in the ${slug} domain: ${name} (file: ${file}). Write the polished version directly back to the vault as ${file} . Search the vault for related files, apply the highest quality Forge template (rich structure, principles, cross-references).` 
      },
    });
    window.dispatchEvent(evt);
  };

  return (
    <button
      onClick={handlePolish}
      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium"
    >
      Polish this item with Hermes (auto write to vault)
    </button>
  );
}
