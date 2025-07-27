import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface MindmapNode {
  name: string;
  children?: MindmapNode[];
}

interface MindmapVisualizationProps {
  data: MindmapNode;
  width?: number;
  height?: number;
  className?: string;
}

const MindmapVisualization: React.FC<MindmapVisualizationProps> = ({
  data,
  width = 800,
  height = 600,
  className = ""
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    console.log("Rendering mindmap with data:", data);
    console.log("Data structure:", JSON.stringify(data, null, 2));
    console.log("Data type:", typeof data, Array.isArray(data));
    
    // Check for valid data structure
    if (typeof data !== 'object' || !data.name) {
      console.error("Invalid mindmap data structure:", data);
      return;
    }
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 120, bottom: 30, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create hierarchy from data
    const root = d3.hierarchy(data);
    
    // Create tree layout
    const treeLayout = d3.tree<MindmapNode>()
      .size([innerHeight, innerWidth]);

    // Apply tree layout
    treeLayout(root);

    // Color scale for different levels
    const colorScale = d3.scaleOrdinal<string, string>()
      .domain(['0', '1', '2', '3'])
      .range(['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))']);

    // Draw links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: d3.HierarchyLink<MindmapNode>) => {
        return `M${d.source.y},${d.source.x}C${(d.source.y! + d.target.y!) / 2},${d.source.x} ${(d.source.y! + d.target.y!) / 2},${d.target.x} ${d.target.y},${d.target.x}`;
      })
      .style('fill', 'none')
      .style('stroke', 'hsl(var(--border))')
      .style('stroke-width', 2)
      .style('stroke-opacity', 0.6);

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: d3.HierarchyNode<MindmapNode>) => `translate(${d.y},${d.x})`);

    // Add circles for nodes
    nodes.append('circle')
      .attr('r', (d: d3.HierarchyNode<MindmapNode>) => {
        // Root node is larger
        if (d.depth === 0) return 12;
        if (d.depth === 1) return 8;
        return 6;
      })
      .style('fill', (d: d3.HierarchyNode<MindmapNode>) => colorScale(d.depth.toString()) as string)
      .style('stroke', 'hsl(var(--background))')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d: d3.HierarchyNode<MindmapNode>) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d.depth === 0 ? 14 : d.depth === 1 ? 10 : 8));
      })
      .on('mouseleave', function(event, d: d3.HierarchyNode<MindmapNode>) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d.depth === 0 ? 12 : d.depth === 1 ? 8 : 6));
      });

    // Add labels
    nodes.append('text')
      .attr('dy', '0.35em')
      .attr('x', (d: d3.HierarchyNode<MindmapNode>) => d.children ? -15 : 15)
      .style('text-anchor', (d: d3.HierarchyNode<MindmapNode>) => d.children ? 'end' : 'start')
      .style('font-size', (d: d3.HierarchyNode<MindmapNode>) => {
        if (d.depth === 0) return '16px';
        if (d.depth === 1) return '14px';
        return '12px';
      })
      .style('font-weight', (d: d3.HierarchyNode<MindmapNode>) => d.depth === 0 ? 'bold' : 'normal')
      .style('fill', 'hsl(var(--foreground))')
      .text((d: d3.HierarchyNode<MindmapNode>) => d.data.name)
      .each(function(d: d3.HierarchyNode<MindmapNode>) {
        // Wrap long text
        const text = d3.select(this);
        const words = d.data.name.split(/\s+/);
        if (words.length > 3) {
          text.text(words.slice(0, 3).join(' ') + '...');
        }
      });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Center the mindmap
    const bounds = g.node()?.getBBox();
    if (bounds) {
      const fullWidth = bounds.width;
      const fullHeight = bounds.height;
      const scale = Math.min(innerWidth / fullWidth, innerHeight / fullHeight) * 0.9;
      const centerX = innerWidth / 2 - (bounds.x + fullWidth / 2) * scale;
      const centerY = innerHeight / 2 - (bounds.y + fullHeight / 2) * scale;
      
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(centerX + margin.left, centerY + margin.top).scale(scale)
      );
    }

    // Add timeout to ensure rendering is completed
    setTimeout(() => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        const bounds = svg.node()?.getBBox();
        if (bounds) {
          console.log("Mindmap bounds:", bounds);
        }
      }
    }, 500);
    
  }, [data, width, height]);

  return (
    <div className={`mindmap-container ${className} w-full`}>
      {data ? (
        <>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="border rounded-lg bg-background"
            style={{ 
              width: '100%', 
              height: '600px', 
              minHeight: '500px', 
              margin: '0 auto',
              opacity: 0,
              animation: 'fadeIn 0.5s ease-out forwards'
            }}
          />
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          <div className="mt-4 text-sm text-center" style={{ color: 'hsl(220, 10%, 45%)' }}>
            <p>Use mouse wheel to zoom, drag to pan</p>
          </div>
        </>
      ) : (
        <div className="border rounded-lg p-8 text-center flex flex-col items-center justify-center" 
             style={{ 
               width: '100%', 
               height: '500px',
               backgroundColor: 'hsl(220, 20%, 97%)'
             }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'hsl(210, 100%, 45%)',
              margin: '0 5px',
              animation: 'bounce 0.6s infinite alternate'
            }}></div>
            <div style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'hsl(210, 100%, 45%)',
              margin: '0 5px',
              animation: 'bounce 0.6s infinite alternate',
              animationDelay: '0.2s'
            }}></div>
            <div style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'hsl(210, 100%, 45%)',
              margin: '0 5px',
              animation: 'bounce 0.6s infinite alternate',
              animationDelay: '0.4s'
            }}></div>
          </div>
          <style>{`
            @keyframes bounce {
              from { transform: translateY(0); }
              to { transform: translateY(-10px); }
            }
          `}</style>
          <p style={{ color: 'hsl(220, 10%, 45%)' }}>Loading mindmap visualization...</p>
        </div>
      )}
    </div>
  );
};

export default MindmapVisualization;
