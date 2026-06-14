'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import MindMapCanvas from '@/app/components/mindmap/MindMapCanvas';
import type { TechniqueCard, MindMap, MindMapMeta } from '@/lib/types';

interface MindMapsClientProps {
  techniques: TechniqueCard[];
  mindMaps: MindMap[];
}

export default function MindMapsClient({ techniques, mindMaps }: MindMapsClientProps) {
  const [pendingAddTech, setPendingAddTech] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [openPositions, setOpenPositions] = useState<Set<string>>(new Set());

  // Current open mind map (for editing + persistence)
  const [currentMap, setCurrentMap] = useState<{
    slug: string;
    title: string;
    nodes: any[];
    edges: any[];
  } | null>(null);

  // Local copy of mind maps for optimistic updates after save (full refresh on next visit)
  const [localMindMaps, setLocalMindMaps] = useState(mindMaps);

  const handleAddTechnique = (tech: TechniqueCard) => {
    setPendingAddTech(tech);
    setTimeout(() => setPendingAddTech(null), 100);
  };

  const openNewMindMap = () => {
    const newSlug = `new-${Date.now()}`;
    setCurrentMap({
      slug: newSlug,
      title: 'Untitled Mind Map',
      nodes: [],
      edges: [],
    });
  };

  const openExistingMindMap = (map: MindMap) => {
    setCurrentMap({
      slug: map.slug,
      title: map.title,
      nodes: map.nodes || [],
      edges: map.edges || [],
    });
  };

  const closeEditor = () => {
    setCurrentMap(null);
    setSearch('');
  };

  const updateCurrentTitle = (newTitle: string) => {
    if (currentMap) {
      setCurrentMap({ ...currentMap, title: newTitle || 'Untitled Mind Map' });
    }
  };

  const togglePosition = (pos: string) => {
    const newSet = new Set(openPositions);
    if (newSet.has(pos)) {
      newSet.delete(pos);
    } else {
      newSet.add(pos);
    }
    setOpenPositions(newSet);
  };

  // Persist the current map to the Obsidian vault
  const handleSaveCurrentMap = async (nodes: any[], edges: any[]) => {
    if (!currentMap) return;

    try {
      const res = await fetch('/api/mindmaps/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentMap.title,
          nodes,
          edges,
          slug: currentMap.slug.startsWith('new-') ? undefined : currentMap.slug,
        }),
      });

      const data = await res.json();

      if (data.success && data.slug) {
        // Update local current map
        const updated = {
          ...currentMap,
          slug: data.slug,
          nodes,
          edges,
        };
        setCurrentMap(updated);

        // Optimistically update the local list so the grid reflects the save immediately
        setLocalMindMaps((prev) => {
          const existingIndex = prev.findIndex((m) => m.slug === data.slug);
          const newEntry = {
            slug: data.slug,
            title: currentMap.title,
            nodes,
            edges,
            updated: new Date().toISOString(),
          } as any;

          if (existingIndex >= 0) {
            const copy = [...prev];
            copy[existingIndex] = { ...copy[existingIndex], ...newEntry };
            return copy;
          } else {
            return [newEntry, ...prev];
          }
        });

        console.log('Mind map saved to vault:', data.filePath);
      } else {
        alert('Save failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Save error', err);
      alert('Failed to save mind map to vault. Check console for details.');
    }
  };

  // Filter techniques (global search across name + position + principle_tags for fast lookup)
  const filteredTechniques = techniques.filter(tech =>
    tech.name.toLowerCase().includes(search.toLowerCase()) ||
    (tech.position || '').toLowerCase().includes(search.toLowerCase()) ||
    (tech.principle_tags || []).some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  // GROK'S FULL IDEAL HIERARCHICAL ARRANGEMENT for the left pane:
  // - Primary hierarchy by BJJ POSITIONAL BUCKETS (the way real players think: "working guard today" → expand only Guard sections).
  //   This maximizes clarity (familiar mental model), efficiency (focus on relevant position, no endless flat list), and minimizes friction (collapsible, search auto-expands, large targets, info at a glance).
  // - Logical flow order: Standing → Guard play → Passing → Control → Recoveries.
  // - Color-coded for instant visual bucket recognition.
  // - Rich but compact items: name, position, media badge, confidence, principle tags on hover.
  // - Search is high-signal and filters the tree live with auto-expand.
  // - Expand/Collapse all + sensible defaults.
  // - Hover shows "Where It Leads" context if available (from card data) for better decision making without leaving the pane.
  const getGroupKey = (tech: TechniqueCard) => {
    const pos = (tech.position || '').toLowerCase();
    const tags = (tech.principle_tags || []).map((t: string) => t.toLowerCase());

    if (pos.includes('standing') || pos.includes('takedown') || pos.includes('pulling')) return 'Standing & Takedowns';
    if (pos.includes('closed-guard')) return 'Guard • Closed Guard';
    if (pos.includes('open-guard') || pos.includes('knee-shield') || pos.includes('spider-guard') || pos.includes('lasso') || pos.includes('de-la-riva')) return 'Guard • Open Guard & Variants';
    if (pos.includes('half-guard') || pos.includes('lockdown')) return 'Guard • Half Guard';
    if (pos.includes('guard-top') || pos.includes('guard pass') || pos.includes('passing') || (pos.includes('pass') && !pos.includes('guard'))) return 'Guard Passing';
    if (pos.includes('side-control')) return 'Side Control';
    if (pos.includes('mount')) return 'Mount';
    if (pos.includes('back')) return 'Back Control';
    if (pos.includes('turtle') || pos.includes('recover') || tags.some((t: string) => t.includes('escape') || t.includes('recover') || t.includes('retention'))) return 'Turtle, Recoveries & Escapes';
    if (pos.includes('knee-on-belly') || pos.includes('knee on belly')) return 'Knee on Belly';
    return 'Other / Transitions';
  };

  const grouped = useMemo(() => {
    const groups: Record<string, TechniqueCard[]> = {};
    filteredTechniques.forEach(tech => {
      const key = getGroupKey(tech);
      if (!groups[key]) groups[key] = [];
      groups[key].push(tech);
    });
    return groups;
  }, [filteredTechniques]);

  const groupOrder = ['Standing & Takedowns', 'Guard • Closed Guard', 'Guard • Open Guard & Variants', 'Guard • Half Guard', 'Guard Passing', 'Side Control', 'Mount', 'Back Control', 'Turtle, Recoveries & Escapes', 'Knee on Belly', 'Other / Transitions'];
  const sortedPositions = Object.keys(grouped).sort((a, b) => {
    const ia = groupOrder.indexOf(a);
    const ib = groupOrder.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  const groupLabel = (key: string) => key;

  const groupColorClass = (key: string) => {
    if (key.includes('Standing')) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (key.includes('Guard')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (key.includes('Passing')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (key.includes('Side') || key.includes('Mount') || key.includes('Back')) return 'bg-red-100 text-red-800 border-red-300';
    if (key.includes('Turtle') || key.includes('Recover')) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Auto-open logic: sensible defaults + all on search
  useEffect(() => {
    if (openPositions.size === 0 && sortedPositions.length > 0) {
      const toOpen = search 
        ? sortedPositions 
        : sortedPositions.filter(p => p.includes('Guard') || p.includes('Standing') || p.includes('Side') || p.includes('Mount')).slice(0, 6);
      setOpenPositions(new Set(toOpen));
    }
  }, [sortedPositions, search]);

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Mind Maps &amp; Flows</h1>
          <p className="text-muted-foreground mt-1">
            Visually build technique chains, positional flows, and personal game plans.
          </p>
        </div>
        <button 
          onClick={openNewMindMap}
          className="px-6 py-2.5 bg-black text-white rounded-2xl text-sm font-medium hover:bg-zinc-900"
        >
          + New Mind Map
        </button>
      </div>

      {currentMap ? (
        <div>
          {/* Editor header with live title editing */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={closeEditor} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to maps
            </button>

            <div className="flex items-center gap-3 flex-1 max-w-md mx-4">
              <input
                type="text"
                value={currentMap.title}
                onChange={(e) => updateCurrentTitle(e.target.value)}
                className="text-lg font-semibold bg-transparent border-b border-muted-foreground/30 focus:border-black outline-none px-1 w-full"
                placeholder="Mind Map Title"
              />
              <div className="text-[10px] text-muted-foreground font-mono truncate">{currentMap.slug}</div>
            </div>

            <div className="text-xs text-emerald-600">Persisted to Obsidian vault</div>
          </div>

          <div className="flex gap-6">
            {/* Technique Browser Sidebar (Grok's ideal hierarchical one) */}
            <div className="w-80 border rounded-2xl p-4 bg-card h-[720px] overflow-auto flex-shrink-0 flex flex-col">
              <div className="font-semibold mb-2 text-sm flex items-center justify-between">
                <span>Add from Vault</span>
                <button 
                  onClick={() => {
                    if (openPositions.size > 0) setOpenPositions(new Set());
                    else setOpenPositions(new Set(sortedPositions));
                  }}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  {openPositions.size > 0 ? 'Collapse all' : 'Expand all'}
                </button>
              </div>

              {/* Quick filter pills */}
              <div className="flex flex-wrap gap-1 mb-3">
                {['All', 'Standing', 'Guard', 'Passing', 'Control', 'Recoveries'].map((f) => {
                  const seed = f === 'All' ? '' : f === 'Control' ? 'side' : f === 'Recoveries' ? 'recover' : f.toLowerCase();
                  const isActive = search.toLowerCase() === seed || (f === 'All' && !search) || (f === 'Guard' && search === 'guard');
                  return (
                    <button
                      key={f}
                      onClick={() => setSearch(seed)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition ${isActive ? 'bg-black text-white border-black' : 'hover:bg-muted'}`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>

              <input 
                type="text" 
                placeholder="Search name, position or principle..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-3 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />

              <div className="flex-1 space-y-1 text-sm overflow-auto pr-1">
                {sortedPositions.length === 0 && search && (
                  <div className="text-muted-foreground text-xs p-2">No matches for "{search}". Try a principle tag like "hip drive" or "frame".</div>
                )}

                {sortedPositions.map(pos => {
                  const items = grouped[pos];
                  const isOpen = openPositions.has(pos) || !!search;
                  const colorClass = groupColorClass(pos);
                  return (
                    <div key={pos} className="border rounded-xl overflow-hidden bg-card">
                      <div 
                        onClick={() => togglePosition(pos)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none border-b hover:brightness-95 ${colorClass}`}
                      >
                        {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        <span className="flex-1">{groupLabel(pos)}</span>
                        <span className="font-mono text-[10px] opacity-70">({items.length})</span>
                      </div>

                      {isOpen && (
                        <div className="bg-white/60">
                          {items
                            .sort((a: TechniqueCard, b: TechniqueCard) => a.name.localeCompare(b.name))
                            .map((tech: TechniqueCard) => {
                              const hasMedia = ((tech.videos?.length || 0) + (tech.photos?.length || 0)) > 0;
                              const conf = tech.confidence || 0;
                              const leadsHint = tech.related_techniques && tech.related_techniques.length > 0 
                                ? `Leads to: ${tech.related_techniques.slice(0,2).join(', ')}...` 
                                : (tech.content || '').match(/## Where It Leads[\s\S]{0,80}/)?.[0]?.replace(/## Where It Leads/, 'Leads to...').trim() || '';
                              return (
                                <div 
                                  key={tech.slug}
                                  onClick={() => handleAddTechnique(tech)}
                                  className="px-3 py-2 border-b last:border-b-0 hover:bg-muted/70 active:bg-zinc-100 cursor-pointer group flex items-start gap-2 text-xs"
                                  title={leadsHint || tech.principle_tags?.join(', ')}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium leading-tight group-hover:text-black line-clamp-2">{tech.name}</div>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                                      <span className="capitalize">{tech.position || '—'}</span>
                                      {hasMedia && <span title="Has video/photo">🎥</span>}
                                      {conf > 0 && <span className="font-mono">★{conf}</span>}
                                    </div>
                                  </div>
                                  {tech.principle_tags && tech.principle_tags.length > 0 && (
                                    <div className="hidden group-hover:flex flex-wrap gap-0.5 text-[9px] self-start pt-0.5">
                                      {tech.principle_tags.slice(0, 2).map((tag: string, i: number) => (
                                        <span key={i} className="bg-white/80 px-1 rounded text-muted-foreground border text-[8px]">{tag}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-muted-foreground mt-2 px-1 pt-2 border-t">
                {search 
                  ? `${filteredTechniques.length} matches across ${sortedPositions.length} groups` 
                  : `${techniques.length} techniques across ${sortedPositions.length} groups`} • Click a technique to add it to the canvas.
              </div>
            </div>

            {/* The Visual Canvas — now saves to your Obsidian vault */}
            <div className="flex-1">
              <MindMapCanvas 
                key={currentMap.slug}
                initialNodes={currentMap.nodes} 
                initialEdges={currentMap.edges} 
                externalAddNode={pendingAddTech} 
                onSave={handleSaveCurrentMap}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create New */}
          <div 
            className="border rounded-2xl p-6 bg-card hover:shadow-sm transition cursor-pointer" 
            onClick={openNewMindMap}
          >
            <div className="text-2xl mb-2">＋</div>
            <div className="font-semibold">Create New Mind Map</div>
            <div className="text-sm text-muted-foreground mt-1">Start building visually. Saved directly to your vault.</div>
          </div>

          {/* Existing maps from vault (live updated after saves) */}
          {localMindMaps.length > 0 ? (
            localMindMaps.map((map) => (
              <div
                key={map.slug}
                className="border rounded-2xl p-6 bg-card hover:shadow-sm transition cursor-pointer"
                onClick={() => openExistingMindMap(map)}
              >
                <div className="font-semibold text-lg tracking-tight line-clamp-2">{map.title}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {map.updated ? `Updated ${new Date(map.updated).toLocaleDateString()}` : 'Saved in vault'}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 font-mono">{map.slug}</div>
                <div className="mt-3 text-xs text-emerald-600">Open in editor →</div>
              </div>
            ))
          ) : (
            <div className="border rounded-2xl p-6 bg-card text-muted-foreground text-sm">
              No saved mind maps yet. Create your first one above — it will appear here and live in your Obsidian vault.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
