import React from 'react';
import MindElixir, { E } from 'react-mindflow';
import 'react-mindflow/dist/style.css';

interface InteractiveMindmapProps {
  data: any;
}

const InteractiveMindmap: React.FC<InteractiveMindmapProps> = ({ data }) => {
  const mindmapData = {
    nodeData: {
      id: 'root',
      topic: data.topic,
      root: true,
      children: data.mindmap.children,
    },
    linkData: {},
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <MindElixir data={mindmapData} />
    </div>
  );
};

export default InteractiveMindmap;
