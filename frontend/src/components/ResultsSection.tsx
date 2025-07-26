import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, HelpCircle, BookOpen, Brain, Download, Share2, Copy, Loader2 } from "lucide-react";
import { useProcessing } from "@/hooks/useProcessing";
import { useToast } from "@/hooks/use-toast";
import type { ProcessingResults } from "@/lib/types";

interface ResultsSectionProps {
  results?: ProcessingResults | null;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ results }) => {
  const { toast } = useToast();

  // If no results, show empty state
  if (!results) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Your Learning Resources</h2>
            <p className="text-muted-foreground">
              Process some content to see your AI-generated learning resources here
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Your Learning Resources</h2>
          <p className="text-muted-foreground">
            AI-generated content based on your input material
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Flashcards
              </TabsTrigger>
              <TabsTrigger value="mindmap" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Mind Map
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              {results.summary ? (
                <Card className="p-8 bg-gradient-card shadow-card border-0">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-foreground">Summary</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(results.summary?.summary || '');
                          toast({
                            title: "Copied!",
                            description: "Summary copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Original Content</h4>
                      <p className="text-sm text-muted-foreground">
                        {results.summary.original_text}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {results.summary.summary}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Original: {results.summary.word_count_original} words</span>
                      <span>Summary: {results.summary.word_count_summary} words</span>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 bg-gradient-card shadow-card border-0">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No summary available. Process some content to generate a summary.</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="quiz">
              {results.quiz ? (
                <div className="space-y-6">
                  {results.quiz.quiz.map((question, index) => (
                    <Card key={index} className="p-6 bg-gradient-card shadow-card border-0">
                      <div className="flex items-start gap-4">
                        <Badge variant="secondary" className="mt-1">
                          Q{index + 1}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold mb-4 text-foreground">
                            {question.question}
                          </h4>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border transition-colors ${
                                  option === question.correct_answer
                                    ? "border-green-500 bg-green-50"
                                    : "border-border"
                                }`}
                              >
                                <span className="text-sm font-medium mr-3">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                {option}
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium text-green-600 mb-1">Correct Answer:</p>
                            <p className="text-sm text-muted-foreground">{question.correct_answer}</p>
                            <p className="text-sm font-medium text-blue-600 mt-2 mb-1">Explanation:</p>
                            <p className="text-sm text-muted-foreground">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 bg-gradient-card shadow-card border-0">
                  <div className="text-center text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No quiz available. Process some content to generate quiz questions.</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="flashcards">
              {results.flashcards ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {results.flashcards.flashcards.map((card, index) => (
                    <Card key={index} className="p-6 bg-gradient-card shadow-card border-0 hover:shadow-elevated transition-all duration-300 cursor-pointer group">
                      <div className="text-center">
                        <div className="mb-4">
                          <Badge variant="outline" className="mb-4">
                            Card {index + 1}
                          </Badge>
                          <Badge variant="secondary" className="ml-2">
                            {card.category}
                          </Badge>
                          <Badge variant="outline" className="ml-2">
                            {card.difficulty}
                          </Badge>
                          <h4 className="text-lg font-semibold text-foreground mb-4">
                            {card.front}
                          </h4>
                        </div>
                        <div className="border-t pt-4 group-hover:opacity-100 opacity-70 transition-opacity">
                          <p className="text-muted-foreground">{card.back}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 bg-gradient-card shadow-card border-0">
                  <div className="text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No flashcards available. Process some content to generate flashcards.</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="mindmap">
              {results.mindmap ? (
                <Card className="p-8 bg-gradient-card shadow-card border-0">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-8 text-foreground">
                      {results.mindmap.topic}
                    </h3>
                    <div className="space-y-8">
                      {results.mindmap.mindmap.children?.map((node, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold mb-4">
                            {node.name}
                          </div>
                          <div className="flex gap-4 flex-wrap justify-center">
                            {node.children?.map((child, childIndex) => (
                              <div
                                key={childIndex}
                                className="bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm"
                              >
                                {child.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 bg-gradient-card shadow-card border-0">
                  <div className="text-center text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No mindmap available. Process some content to generate a mindmap.</p>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-center gap-4 mt-8">
            <Button variant="hero" size="lg">
              <Share2 className="h-5 w-5" />
              Share Results
            </Button>
            <Button variant="outline" size="lg">
              <Download className="h-5 w-5" />
              Export All
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;