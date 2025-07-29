import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Download } from 'lucide-react';
import MermaidDiagram from '@/components/MermaidDiagram';
import ErrorBoundary from '@/components/ErrorBoundary';
import { convertMindmapToMermaid, convertMindmapToRadialMermaid } from '@/utils/mindmapToMermaid';
import type { MindmapOutput } from '@/lib/types';

interface MindmapViewerProps {
  mindmap: MindmapOutput;
  className?: string;
  zoomLevel?: number;
  layout?: 'vertical' | 'horizontal';
}

const MindmapViewer: React.FC<MindmapViewerProps> = ({ mindmap, className = "", zoomLevel = 1, layout = 'vertical' }) => {
  const mermaidChart = useMemo(() => {
    try {
      if (!mindmap?.topic || !mindmap?.mindmap) {
        return 'graph TD\n  error["Invalid mindmap data"]\n';
      }

      const mindmapData = {
        topic: mindmap.topic,
        mindmap: mindmap.mindmap
      };

      return layout === 'vertical' 
        ? convertMindmapToMermaid(mindmapData)
        : convertMindmapToRadialMermaid(mindmapData);
    } catch (error) {
      console.error('Error generating Mermaid chart:', error);
      return 'graph TD\n  error["Error generating diagram"]\n';
    }
  }, [mindmap, layout]);

  const handleDownload = () => {
    try {
      const svg = document.querySelector('.mermaid-diagram svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `${mindmap.topic || 'mindmap'}-mindmap.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
      }
    } catch (error) {
      console.error('Error downloading SVG:', error);
    }
  };

  if (!mindmap?.topic || !mindmap?.mindmap) {
    return (
      <div className={`${className}`}>
        <div className="text-center text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Invalid mindmap data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Zoomable diagram content ONLY - separate from controls */}
      <div className="mindmap-diagram-wrapper">
        <div
          className="mindmap-zoom-content"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center top',
            transition: 'transform 0.2s ease',
            width: '100%',
            padding: '20px'
          }}
        >
          <ErrorBoundary>
            <MermaidDiagram
              chart={mermaidChart}
              className="w-full"
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default MindmapViewer;
