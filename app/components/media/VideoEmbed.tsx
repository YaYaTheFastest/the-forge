'use client';

interface VideoEmbedProps {
  url: string;
  title?: string;
  credit?: string;
  timestamp?: string;
}

export function VideoEmbed({ url, title, credit, timestamp }: VideoEmbedProps) {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?]+)/);
  if (ytMatch) {
    const videoId = ytMatch[1];
    const embedUrl = `https://www.youtube.com/embed/${videoId}${timestamp ? `?start=${parseTimestamp(timestamp)}` : ''}`;
    return (
      <div className="my-4">
        <div className="aspect-video w-full rounded-2xl overflow-hidden border bg-black">
          <iframe
            src={embedUrl}
            title={title || "Technique Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        {(title || credit) && (
          <div className="mt-2 text-sm text-muted-foreground">
            {title && <span className="font-medium">{title}</span>}
            {credit && <span> — {credit}</span>}
            {timestamp && <span className="ml-2 text-xs">({timestamp})</span>}
          </div>
        )}
      </div>
    );
  }

  // Instagram / general link fallback
  return (
    <div className="my-4 p-4 border rounded-2xl bg-card">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline font-medium"
      >
        {title || "Watch Video"} {credit ? `— ${credit}` : ''}
      </a>
      <div className="text-xs text-muted-foreground mt-1">Opens in new tab (Instagram / external)</div>
    </div>
  );
}

function parseTimestamp(ts: string): number {
  const parts = ts.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}
