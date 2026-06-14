'use client';

import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CategoryBadge } from '../CategoryBadge';
import { StarRating } from '../StarRating';

interface TechniqueNodeData {
  name: string;
  position?: string;
  category?: string;
  confidence?: number;
  id: string;
}

const nodeTypes = {
  technique: ({ data }: { data: TechniqueNodeData }) => (
    <div className="px-4 py-3 rounded-2xl border bg-white shadow-md min-w-[220px] text-sm">
      <div className="font-semibold leading-tight mb-1.5 pr-2">{data.name}</div>
      
      {data.position && (
        <div className="text-xs text-muted-foreground capitalize mb-2">
          {data.position.replace(/-/g, ' ')}
        </div>
      )}

      <div className="flex items-center justify-between">
        <CategoryBadge category={data.category} className="text-[10px]" />
        <StarRating value={data.confidence} size="sm" showNumber={false} />
      </div>
    </div>
  ),
};

interface MindMapCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  externalAddNode?: any; // technique object from parent
}

export default function MindMapCanvas({ 
  initialNodes = [], 
  initialEdges = [],
  onSave,
  externalAddNode 
}: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle external node addition from sidebar
  useEffect(() => {
    if (externalAddNode) {
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'technique',
        position: { 
          x: Math.random() * 500 + 80, 
          y: Math.random() * 350 + 80 
        },
        data: {
          name: externalAddNode.name,
          position: externalAddNode.position,
          category: externalAddNode.category,
          confidence: externalAddNode.confidence,
          id: externalAddNode.slug,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    }
  }, [externalAddNode]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#000' } }, eds)),
    [setEdges]
  );

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    } else {
      // Legacy fallback (should rarely be used now that MindMapsClient always passes onSave)
      localStorage.setItem('current-mindmap', JSON.stringify({ nodes, edges }));
      console.log('Mind map saved to localStorage (no onSave handler provided).');
    }
  };

  return (
    <div className="h-[700px] w-full border rounded-2xl overflow-hidden bg-[#f8f9fa] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#f8f9fa]"
      >
        <Controls />
        <MiniMap 
          nodeColor={(n) => {
            const cat = (n.data as any)?.category;
            if (cat === 'submission') return '#e11d48';
            if (cat === 'sweep') return '#2563eb';
            return '#64748b';
          }} 
        />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
      </ReactFlow>

      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium shadow-sm hover:bg-zinc-900"
        >
          Save to Vault
        </button>
      </div>

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-xs text-muted-foreground border">
        Drag nodes • Connect with edges • Add techniques from sidebar
      </div>
    </div>
  );
}
