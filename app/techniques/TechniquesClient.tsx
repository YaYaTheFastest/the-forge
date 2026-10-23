'use client';

import { useState, useMemo, useEffect } from 'react';
import type { TechniqueCard } from '@/lib/types';
import { Star, Video, Search, X } from 'lucide-react';
import { TechniqueCard as Card } from '@/app/components/TechniqueCard';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
  submission: { bg: 'bg-red-100', text: 'text-red-700', label: 'Submission' },
  'submission-retention': { bg: 'bg-red-100', text: 'text-red-700', label: 'Submission' },
  sweep: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sweep' },
  'guard-pass': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Guard Pass' },
  'guard-passing': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Guard Pass' },
  pass: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Pass' },
  defense: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Defense' },
  escape: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Escape' },
  takedown: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Takedown' },
  transition: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Transition' },
  'mount-transition': { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Transition' },
  'position-transition': { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Transition' },
  'guard-recovery': { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Guard Recovery' },
  'self-defense': { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Self Defense' },
  guard: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Guard' },
};

// Deduplicate pills by the label they will display (prevents multiple "Submission", "Guard Pass", "Transition" buttons caused by alias keys like 'guard-passing' vs 'guard-pass')
const seenLabels = new Set<string>();
const allCategories = Object.keys(categoryStyles).filter(key => {
  const label = categoryStyles[key].label;
  if (seenLabels.has(label)) return false;
  seenLabels.add(label);
  return true;
});

function getCategoryHex(cat?: string): string {
  const key = (cat || '').toLowerCase();
  const map: Record<string, string> = {
    submission: '#e11d48', sweep: '#2563eb', 'guard-pass': '#059669', pass: '#059669',
    defense: '#475569', escape: '#d97706', takedown: '#ea580c', transition: '#7c3aed',
    'guard-recovery': '#0891b2', 'self-defense': '#be123c',
  };
  return map[key] || '#64748b';
}

function getCategoryStyle(cat?: string) {
  const key = (cat || '').toLowerCase();
  return categoryStyles[key] || { bg: 'bg-gray-100', text: 'text-gray-700', label: cat || 'Technique' };
}

function StarRating({ value = 0 }: { value?: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
      <span className="ml-1.5 text-xs font-medium text-gray-500">{value}/5</span>
    </div>
  );
}

export default function TechniquesClient({ 
  initialTechniques, 
  initialSearch = '',
  initialCategory = '',
  initialMinConfidence = 0
}: { 
  initialTechniques: TechniqueCard[]; 
  initialSearch?: string;
  initialCategory?: string;
  initialMinConfidence?: number;
}) {
  // Robust normalizer + light synonyms for real vault frontmatter values
  const normalizeForMatch = (str: string): string => {
    let s = (str || '').toLowerCase().replace(/[-_\s]+/g, '-').trim();
    const syn: Record<string, string> = {
      'guard pass': 'guard-pass',
      'guardpass': 'guard-pass',
      'guard-passing': 'guard-pass',
      'position transition': 'position-transition',
      'mount transition': 'mount-transition',
      'self defense': 'self-defense',
      'ransition': 'transition',
      'akedown': 'takedown',
    };
    return syn[s] || s;
  };

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (initialCategory) {
      const norm = normalizeForMatch(initialCategory);
      const exact = allCategories.find(c => normalizeForMatch(c) === norm);
      if (exact) return [exact];
      const match = allCategories.find(c => {
        const cn = normalizeForMatch(c);
        return cn.includes(norm) || norm.includes(cn);
      });
      return match ? [match] : [initialCategory];
    }
    return [];
  });
  const [showOnlyGB1, setShowOnlyGB1] = useState(false);
  const [minConfidence, setMinConfidence] = useState(initialMinConfidence ?? 0);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasNotes, setHasNotes] = useState(false); // new quality filter
  const [highQuality, setHighQuality] = useState(false); // new quality filter for strong cards

  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();

  // Sync FROM current URL (handles direct links, browser back/forward, principle chip router.push, etc.)
  useEffect(() => {
    // Categories (support repeated ?category=foo&category=bar or comma)
    const rawCats = urlSearchParams.getAll('category').length
      ? urlSearchParams.getAll('category')
      : (urlSearchParams.get('category') || urlSearchParams.get('cat') || '').split(/[,]/).filter(Boolean);
    if (rawCats.length) {
      const resolved: string[] = [];
      for (const p of rawCats) {
        const norm = normalizeForMatch(p);
        const m = allCategories.find(c => normalizeForMatch(c) === norm || normalizeForMatch(c).includes(norm) || norm.includes(normalizeForMatch(c)));
        resolved.push(m || p);
      }
      if (JSON.stringify(resolved.sort()) !== JSON.stringify([...selectedCategories].sort())) {
        setSelectedCategories(resolved);
      }
    }

    // Min Confidence
    const rawMin = urlSearchParams.get('minConfidence') || urlSearchParams.get('min') || '';
    if (rawMin) {
      const n = Math.max(0, Math.min(5, parseInt(rawMin, 10) || 0));
      if (n !== minConfidence) setMinConfidence(n);
    }
  }, [urlSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync TO URL whenever the requested filter controls change (makes filters shareable + back-button friendly)
  useEffect(() => {
    const params = new URLSearchParams();
    // Only the two requested filters for this fix (category + minConfidence). Others remain client-only for now.
    selectedCategories.forEach(c => params.append('category', c)); // repeated params = clean multi-select
    if (minConfidence > 0) params.set('minConfidence', String(minConfidence));

    // Preserve other known params if present (search etc. from chips)
    const existingSearch = urlSearchParams.get('search');
    if (existingSearch) params.set('search', existingSearch);

    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [selectedCategories, minConfidence, pathname, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return initialTechniques.filter(tech => {
      const q = search.toLowerCase().trim();

      const matchesSearch = !q || 
        tech.name.toLowerCase().includes(q) ||
        (tech.principle_tags || []).some((t: string) => t.toLowerCase().includes(q)) ||
        (Array.isArray(tech.category) ? tech.category : (tech.category ? [tech.category] : [])).some((c: any) => String(c || '').toLowerCase().includes(q)) ||
        (tech.position || '').toLowerCase().includes(q) ||
        (tech.gb_curriculum || []).some((g: string) => g.toLowerCase().includes(q));

      const matchesCategory = selectedCategories.length === 0 || (() => {
        const cats = Array.isArray(tech.category) ? tech.category : (tech.category ? [tech.category] : []);
        const pos = tech.position ? [tech.position] : [];
        const allTags = [...cats, ...pos].map((x: any) => String(x || ''));
        return allTags.some((tag: string) => {
          const tagNorm = normalizeForMatch(tag);
          return selectedCategories.some(selected => {
            const sNorm = normalizeForMatch(selected);
            // Special boost for "Guard" pill to catch position-based guard types (closed-guard, open-guard, half-guard etc.)
            if (sNorm === 'guard' && (tagNorm.includes('guard') || tagNorm.includes('closed') || tagNorm.includes('open') || tagNorm.includes('half'))) {
              return true;
            }
            return tagNorm === sNorm || tagNorm.includes(sNorm) || sNorm.includes(tagNorm);
          });
        });
      })();
      const matchesGB1 = !showOnlyGB1 || (tech.gb_curriculum && tech.gb_curriculum.some(g => g.includes('GB1')));
      const matchesConfidence = (tech.confidence || 0) >= minConfidence;
      const matchesVideo = !hasVideo || (tech.videos && tech.videos.length > 0);
      const matchesNotes = !hasNotes || (tech.personalNotes && tech.personalNotes.trim().length > 20);
      const matchesHighQuality = !highQuality || (
        (tech.gb_curriculum && tech.gb_curriculum.length > 0) &&
        (tech.confidence || 0) >= 3 &&
        (tech.videos && tech.videos.length > 0 || (tech.personalNotes && tech.personalNotes.trim().length > 50))
      );
      return matchesSearch && matchesCategory && matchesGB1 && matchesConfidence && matchesVideo && matchesNotes && matchesHighQuality;
    });
  }, [initialTechniques, search, selectedCategories, showOnlyGB1, minConfidence, hasVideo]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setShowOnlyGB1(false);
    setMinConfidence(0);
    setHasVideo(false);
    setHasNotes(false);
    setHighQuality(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Techniques</h1>
        <div className="text-xs md:text-sm text-muted-foreground tabular-nums">{filtered.length} / {initialTechniques.length}</div>
      </div>

      {/* Filters — optimized for iPhone/iPad */}
      <div className="mb-6 md:mb-8 rounded-2xl border bg-card p-4 md:p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search techniques..."
              className="w-full pl-9 h-10 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <button onClick={clearFilters} className="filter-button text-sm border-border hover:bg-muted flex items-center gap-2">
            <X className="h-4 w-4" /> Clear
          </button>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Categories</div>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => {
              const active = selectedCategories.includes(cat);
              const style = getCategoryStyle(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`filter-button ${active ? 'filter-button-active' : 'border-border hover:bg-muted'}`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showOnlyGB1} onChange={(e) => setShowOnlyGB1(e.target.checked)} className="accent-black" />
            <span>Only GB1 Curriculum</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={hasVideo} onChange={(e) => setHasVideo(e.target.checked)} className="accent-black" />
            <span className="flex items-center gap-1"><Video className="h-4 w-4" /> Has Video</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={hasNotes} onChange={(e) => setHasNotes(e.target.checked)} className="accent-black" />
            <span>Has Notes</span>
          </label>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Min Confidence:</span>
            {[0,1,2,3,4,5].map(n => (
              <button 
                key={n} 
                onClick={() => setMinConfidence(n)} 
                className={`filter-button text-xs ${minConfidence === n ? 'filter-button-active' : 'border-border hover:bg-muted'}`}
              >
                {n}+
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" checked={highQuality} onChange={(e) => setHighQuality(e.target.checked)} className="accent-black" />
            <span>High Quality (GB1 + conf 3+ + media/notes)</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((tech) => (
          <Card key={tech.slug} tech={tech} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No techniques match the current filters.</div>
      )}
    </div>
  );
}
