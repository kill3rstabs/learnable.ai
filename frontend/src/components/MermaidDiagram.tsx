import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { Loader2 } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderedSvg, setRenderedSvg] = useState<string | null>(null);
  const renderIdRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate unique ID for each diagram
  const generateUniqueId = useCallback(() => {
    return `mermaid-diagram-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Clear any existing mermaid elements
    if (containerRef.current) {
      const existingSvg = containerRef.current.querySelector('svg');
      if (existingSvg) {
        try {
          existingSvg.remove();
        } catch (e) {
          // If remove() fails, try innerHTML
          containerRef.current.innerHTML = '';
        }
      }
    }
  }, []);

  // Validate chart content
  const validateChart = useCallback((chartContent: string): boolean => {
    if (!chartContent || typeof chartContent !== 'string') {
      return false;
    }
    
    const trimmed = chartContent.trim();
    if (trimmed.length === 0) {
      return false;
    }
    
    // Basic validation for Mermaid syntax
    const validStarters = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'quadrantChart', 'requirement', 'gitgraph', 'mindmap', 'timeline', 'zenuml', 'sankey'];
    const hasValidStarter = validStarters.some(starter => trimmed.toLowerCase().startsWith(starter.toLowerCase()));
    
    return hasValidStarter;
  }, []);

  useEffect(() => {
    // Initialize mermaid with theme-aware configuration
    const isDark = document.documentElement.classList.contains('dark');
    
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 50,
        rankSpacing: 50,
      },
      themeVariables: isDark ? {
        primaryColor: '#3b82f6',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#1d4ed8',
        lineColor: '#9ca3af',
        secondaryColor: '#374151',
        tertiaryColor: '#1f2937',
        background: '#111827',
        textColor: '#f9fafb',
      } : {
        primaryColor: '#3b82f6',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#1d4ed8',
        lineColor: '#6b7280',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#ffffff',
        background: '#ffffff',
        textColor: '#111827',
      }
    });
  }, []);

  useEffect(() => {
    if (!chart || !containerRef.current) {
      setRenderedSvg(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Validate chart content
    if (!validateChart(chart)) {
      setError('Invalid chart content');
      setIsLoading(false);
      setRenderedSvg(null);
      return;
    }

    // Cleanup previous render
    cleanup();
    
    // Create new abort controller for this render
    abortControllerRef.current = new AbortController();
    const abortController = abortControllerRef.current;

    setIsLoading(true);
    setError(null);
    setRenderedSvg(null);

    // Generate unique ID for this render
    const uniqueId = generateUniqueId();
    renderIdRef.current = uniqueId;

    // Small delay to ensure DOM is ready
    const renderTimeout = setTimeout(async () => {
      try {
        // Check if this render was aborted
        if (abortController.signal.aborted) {
          return;
        }

        // Render the chart
        const { svg } = await mermaid.render(uniqueId, chart);
        
        // Check if this render was aborted or if the component unmounted
        if (abortController.signal.aborted || !containerRef.current) {
          return;
        }

        // Validate SVG content
        if (!svg || typeof svg !== 'string' || svg.trim().length === 0) {
          throw new Error('Generated SVG is empty or invalid');
        }

        setRenderedSvg(svg);
        setIsLoading(false);
      } catch (error) {
        // Check if this render was aborted
        if (abortController.signal.aborted) {
          return;
        }

        console.error('Mermaid rendering error:', error);
        setError('Failed to render diagram');
        setIsLoading(false);
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(renderTimeout);
      cleanup();
    };
  }, [chart, cleanup, generateUniqueId, validateChart]);

  // Effect to update DOM when SVG is ready
  useEffect(() => {
    if (renderedSvg && containerRef.current) {
      try {
        // Clear existing content
        containerRef.current.innerHTML = '';
        
        // Create a temporary container to parse the SVG
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = renderedSvg;
        
        // Get the SVG element
        const svgElement = tempDiv.querySelector('svg');
        if (svgElement) {
          // Append the SVG to the container
          containerRef.current.appendChild(svgElement);
        } else {
          throw new Error('No SVG element found in rendered content');
        }
      } catch (error) {
        console.error('Error updating DOM with SVG:', error);
        setError('Failed to display diagram');
      }
    }
  }, [renderedSvg]);

  return (
    <div 
      ref={containerRef} 
      className={`mermaid-diagram ${className}`}
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '200px'
      }}
    >
      {isLoading && !renderedSvg && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Rendering diagram...</span>
        </div>
      )}
      {error && (
        <div className="text-red-500 text-center p-4">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default MermaidDiagram; 