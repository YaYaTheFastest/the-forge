'use client';

import { VideoEmbed } from './VideoEmbed';

interface MediaItem {
  url: string;
  title?: string;
  credit?: string;
  timestamp?: string;
  caption?: string;
}

interface MediaSectionProps {
  videos?: MediaItem[];
  photos?: MediaItem[];
}

export function MediaSection({ videos = [], photos = [] }: MediaSectionProps) {
  if (videos.length === 0 && photos.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight mb-4">Media &amp; Visual References</h2>

      {videos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Videos</h3>
          <div className="space-y-6">
            {videos.map((video, idx) => (
              <VideoEmbed key={idx} {...video} />
            ))}
          </div>
        </div>
      )}

      {photos.length > 0 && (
        <div>
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Photos &amp; Diagrams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map((photo, idx) => (
              <div key={idx} className="border rounded-2xl overflow-hidden bg-card">
                <img 
                  src={photo.url} 
                  alt={photo.caption || "Technique photo"} 
                  className="w-full object-cover" 
                />
                {photo.caption && (
                  <div className="p-3 text-sm text-muted-foreground">
                    {photo.caption}
                    {photo.credit && <span className="block text-xs mt-1">— {photo.credit}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
