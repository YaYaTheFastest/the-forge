'use client';

import { useTransition } from 'react';

interface HermesTriggerClientProps {
  action: (formData: FormData) => Promise<any>;
  slug: string;
}

export function HermesTriggerClient({ action, slug }: HermesTriggerClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const formData = new FormData();
    formData.append('recentChange', 'Manual review request from Equipment detail page');

    startTransition(async () => {
      const result = await action(formData);

      if (result?.success && result?.taskContent) {
        // Maximum frictionless: Immediately send to Hermes via the iOS Shortcut
        const shortcutName = 'Send Latest Hermes Task';
        const encodedContent = encodeURIComponent(result.taskContent);
        const url = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}&input=text&text=${encodedContent}`;
        
        // Fire the Shortcut (this will switch to Shortcuts app and send)
        window.location.href = url;
      } else {
        alert('Hermes task created in vault, but auto-send failed. Please use the Shortcut manually.');
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white active:bg-violet-700 disabled:opacity-60"
    >
      {isPending ? 'Creating & Sending to Hermes...' : '📋 Create Hermes Standardization Review Task'}
    </button>
  );
}
