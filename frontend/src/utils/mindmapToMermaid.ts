import type { MindmapNode, MindmapOutput } from '@/lib/types';

interface MindmapData {
  topic: string;
  mindmap: MindmapNode;
}

// Helper function to sanitize node names for Mermaid
const sanitizeNodeName = (name: string): string => {
  if (!name) return 'Unnamed';
  
  // Remove or replace characters that might cause issues in Mermaid
  return name
    .replace(/[\[\](){}]/g, '') // Remove brackets and parentheses
    .replace(/[^\w\s\-_]/g, '') // Keep only alphanumeric, spaces, hyphens, and underscores
    .trim()
    .substring(0, 50); // Limit length to prevent overflow
};

// Helper function to generate safe node IDs
const generateSafeId = (baseId: string): string => {
  return baseId.replace(/[^a-zA-Z0-9_]/g, '_');
};

export const convertMindmapToMermaid = (mindmapData: MindmapData): string => {
  if (!mindmapData?.mindmap?.children || mindmapData.mindmap.children.length === 0) {
    return 'graph TD\n  empty["No data available"]\n';
  }

  let mermaidCode = 'graph TD\n';
  
  // Add the main topic as the root node
  const rootId = 'root';
  const sanitizedTopic = sanitizeNodeName(mindmapData.topic);
  mermaidCode += `  ${rootId}["${sanitizedTopic}"]\n`;
  
  // Process children recursively
  const processNode = (node: MindmapNode, parentId: string, level: number = 1): void => {
    if (!node.children || node.children.length === 0) return;
    
    node.children.forEach((child, index) => {
      if (!child.name) return; // Skip nodes without names
      
      const childId = generateSafeId(`${parentId}_${level}_${index}`);
      const sanitizedChildName = sanitizeNodeName(child.name);
      
      mermaidCode += `  ${childId}["${sanitizedChildName}"]\n`;
      mermaidCode += `  ${parentId} --> ${childId}\n`;
      
      // Process children of this node
      if (child.children && child.children.length > 0) {
        processNode(child, childId, level + 1);
      }
    });
  };
  
  // Process all root children
  mindmapData.mindmap.children.forEach((node, index) => {
    if (!node.name) return; // Skip nodes without names
    
    const nodeId = generateSafeId(`${rootId}_0_${index}`);
    const sanitizedNodeName = sanitizeNodeName(node.name);
    
    mermaidCode += `  ${nodeId}["${sanitizedNodeName}"]\n`;
    mermaidCode += `  ${rootId} --> ${nodeId}\n`;
    
    // Process children of this node
    if (node.children && node.children.length > 0) {
      processNode(node, nodeId, 1);
    }
  });
  
  return mermaidCode;
};

// Alternative function for a more radial layout
export const convertMindmapToRadialMermaid = (mindmapData: MindmapData): string => {
  if (!mindmapData?.mindmap?.children || mindmapData.mindmap.children.length === 0) {
    return 'graph LR\n  empty["No data available"]\n';
  }

  let mermaidCode = 'graph LR\n';
  
  // Add the main topic as the root node
  const rootId = 'root';
  const sanitizedTopic = sanitizeNodeName(mindmapData.topic);
  mermaidCode += `  ${rootId}["${sanitizedTopic}"]\n`;
  
  // Process children recursively
  const processNode = (node: MindmapNode, parentId: string, level: number = 1): void => {
    if (!node.children || node.children.length === 0) return;
    
    node.children.forEach((child, index) => {
      if (!child.name) return; // Skip nodes without names
      
      const childId = generateSafeId(`${parentId}_${level}_${index}`);
      const sanitizedChildName = sanitizeNodeName(child.name);
      
      mermaidCode += `  ${childId}["${sanitizedChildName}"]\n`;
      mermaidCode += `  ${parentId} --> ${childId}\n`;
      
      // Process children of this node
      if (child.children && child.children.length > 0) {
        processNode(child, childId, level + 1);
      }
    });
  };
  
  // Process all root children
  mindmapData.mindmap.children.forEach((node, index) => {
    if (!node.name) return; // Skip nodes without names
    
    const nodeId = generateSafeId(`${rootId}_0_${index}`);
    const sanitizedNodeName = sanitizeNodeName(node.name);
    
    mermaidCode += `  ${nodeId}["${sanitizedNodeName}"]\n`;
    mermaidCode += `  ${rootId} --> ${nodeId}\n`;
    
    // Process children of this node
    if (node.children && node.children.length > 0) {
      processNode(node, nodeId, 1);
    }
  });
  
  return mermaidCode;
}; 