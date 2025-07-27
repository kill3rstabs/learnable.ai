import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Play, RotateCcw } from 'lucide-react';
import MermaidDiagram from '@/components/MermaidDiagram';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { MindmapOutput } from '@/lib/types';

// Sample mindmap data for demonstration
const sampleMindmap: MindmapOutput = {
  success: true,
  topic: "Machine Learning Fundamentals",
  mindmap: {
    name: "Machine Learning Fundamentals",
    children: [
      {
        name: "Supervised Learning",
        children: [
          { name: "Classification" },
          { name: "Regression" },
          { name: "Neural Networks" }
        ]
      },
      {
        name: "Unsupervised Learning",
        children: [
          { name: "Clustering" },
          { name: "Dimensionality Reduction" },
          { name: "Association Rules" }
        ]
      },
      {
        name: "Reinforcement Learning",
        children: [
          { name: "Q-Learning" },
          { name: "Policy Gradient" },
          { name: "Deep RL" }
        ]
      },
      {
        name: "Model Evaluation",
        children: [
          { name: "Cross Validation" },
          { name: "Metrics" },
          { name: "Hyperparameter Tuning" }
        ]
      }
    ]
  },
  content_type: "text"
};

const MindmapDemo: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');

  const mermaidChart = useMemo(() => {
    try {
      const mindmapData = {
        topic: sampleMindmap.topic,
        mindmap: sampleMindmap.mindmap
      };

      if (layout === 'vertical') {
        return `graph TD
  root["${mindmapData.topic}"]
  root --> supervised["Supervised Learning"]
  root --> unsupervised["Unsupervised Learning"]
  root --> reinforcement["Reinforcement Learning"]
  root --> evaluation["Model Evaluation"]
  
  supervised --> classification["Classification"]
  supervised --> regression["Regression"]
  supervised --> neural["Neural Networks"]
  
  unsupervised --> clustering["Clustering"]
  unsupervised --> dimensionality["Dimensionality Reduction"]
  unsupervised --> association["Association Rules"]
  
  reinforcement --> qlearning["Q-Learning"]
  reinforcement --> policy["Policy Gradient"]
  reinforcement --> deeprl["Deep RL"]
  
  evaluation --> crossval["Cross Validation"]
  evaluation --> metrics["Metrics"]
  evaluation --> hyperparam["Hyperparameter Tuning"]`;
      }
      return `graph LR
  root["${mindmapData.topic}"]
  root --> supervised["Supervised Learning"]
  root --> unsupervised["Unsupervised Learning"]
  root --> reinforcement["Reinforcement Learning"]
  root --> evaluation["Model Evaluation"]
  
  supervised --> classification["Classification"]
  supervised --> regression["Regression"]
  supervised --> neural["Neural Networks"]
  
  unsupervised --> clustering["Clustering"]
  unsupervised --> dimensionality["Dimensionality Reduction"]
  unsupervised --> association["Association Rules"]
  
  reinforcement --> qlearning["Q-Learning"]
  reinforcement --> policy["Policy Gradient"]
  reinforcement --> deeprl["Deep RL"]
  
  evaluation --> crossval["Cross Validation"]
  evaluation --> metrics["Metrics"]
  evaluation --> hyperparam["Hyperparameter Tuning"]`;
    } catch (error) {
      console.error('Error generating demo Mermaid chart:', error);
      return 'graph TD\n  error["Error generating demo diagram"]\n';
    }
  }, [layout]);

  if (!showDemo) {
    return (
      <Card className="p-8 bg-gradient-card shadow-card border-0">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2 text-foreground">Mermaid Mindmap Demo</h3>
          <p className="text-muted-foreground mb-6">
            See how mindmaps are now rendered using beautiful Mermaid diagrams
          </p>
          <Button onClick={() => setShowDemo(true)} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            View Demo
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {sampleMindmap.topic}
          </h3>
          <p className="text-muted-foreground">
            Interactive Mermaid diagram demonstration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            Demo
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
          onClick={() => setShowDemo(false)}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Hide Demo
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

export default MindmapDemo; 