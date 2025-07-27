import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, RotateCcw, Download } from 'lucide-react';
import MermaidDiagram from '@/components/MermaidDiagram';
import ErrorBoundary from '@/components/ErrorBoundary';
import { convertMindmapToMermaid, convertMindmapToRadialMermaid } from '@/utils/mindmapToMermaid';
import type { MindmapOutput } from '@/lib/types';

interface MindmapViewerProps {
  mindmap: MindmapOutput;
  className?: string;
}

const MindmapViewer: React.FC<MindmapViewerProps> = ({ mindmap, className = "" }) => {
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');

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
      <Card className={`p-6 bg-gradient-card shadow-card border-0 ${className}`}>
        <div className="text-center text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Invalid mindmap data</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-gradient-card shadow-card border-0 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {mindmap.topic}
          </h3>
          <p className="text-muted-foreground">
            Visual representation of key concepts and their relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            Mindmap
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button
            variant={layout === 'vertical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayout('vertical')}
          >
            Vertical Layout
          </Button>
          <Button
            variant={layout === 'horizontal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayout('horizontal')}
          >
            Horizontal Layout
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download SVG
        </Button>
      </div>

      <div className="bg-background/50 p-6 rounded-lg border border-border/50">
        <ErrorBoundary>
          <MermaidDiagram 
            chart={mermaidChart}
            className="w-full"
          />
        </ErrorBoundary>
      </div>
    </Card>
  );
};

export default MindmapViewer; 