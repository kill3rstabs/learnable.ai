import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Video, FileText, Headphones, Brain, Target, BookOpen, Zap } from "lucide-react";

const HeroSection = () => {
  const features = [
    {
      icon: FileText,
      title: "Smart Summaries",
      description: "Get concise, structured summaries from any content"
    },
    {
      icon: Target,
      title: "Interactive Quizzes",
      description: "Generate MCQs, true/false, and fill-in-the-blank questions"
    },
    {
      icon: BookOpen,
      title: "Digital Flashcards",
      description: "Create memorable flashcards for effective studying"
    },
    {
      icon: Brain,
      title: "Mind Maps",
      description: "Visualize concepts with hierarchical mind maps"
    }
  ];

  return (
    <section className="py-28 bg-green-50">
      <div className="container mx-auto px-4">
        <div className=" mb-16 justify-items-start justify-start mx-16 py-6">
          <div className="inline-flex bg-green-100 px-3 gap-2 bg-muted/50 rounded-full py-2 mb-6">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Powered by Google Gemini AI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-green-600 ">
            Transform Any Content Into
            <br />
            <span className="text-foreground">Learning Resources</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Upload videos, audio, or text and instantly generate summaries, quizzes, flashcards, and mind maps using advanced AI technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button  size="lg" className="text-lg font-semibold text-white px-8 bg-green-500 rounded-3xl">
              Start Learning Now
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button  size="lg" className="text-lg font-semibold hover:bg-green-500 hover:text-white text-green-600 border-green-500 rounded-3xl border-2 px-8">
              <Video className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-0">
              <div className="mb-4">
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-6 bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Video</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium">Audio</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Text</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;