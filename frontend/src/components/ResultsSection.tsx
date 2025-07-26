import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, HelpCircle, BookOpen, Brain, Download, Share2, Copy, Loader2, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useProcessing } from "@/hooks/useProcessing";
import { useToast } from "@/hooks/use-toast";
import type { ProcessingResults } from "@/lib/types";
import { useState, useEffect } from "react";
import InteractiveMindmap from './InteractiveMindmap';

interface ResultsSectionProps {
  results?: ProcessingResults | null;
  activeTab: string;
}

// Quiz state interface
interface QuizState {
  currentQuestion: number;
  userAnswers: (string | null)[];
  showResults: boolean;
  score: number;
}

// Markdown renderer component
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Simple markdown parser for basic formatting
  const renderMarkdown = (text: string) => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3 text-foreground">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
      // Wrap lists in ul tags (simple approach)
      .replace(/(<li.*<\/li>)/gs, '<ul class="list-disc space-y-1 my-3">$1</ul>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-lg my-3 overflow-x-auto"><code class="text-sm">$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>')
      // Wrap in paragraph tags
      .replace(/^(?!<[h|u|p|pre])(.*)/gim, '<p class="mb-3 leading-relaxed">$1')
      .replace(/(.*?)(?=<h[1-3]|$)/gs, (match) => {
        if (match.trim() && !match.startsWith('<')) {
          return `<p class="mb-3 leading-relaxed">${match}</p>`;
        }
        return match;
      });
  };

  return (
    <div 
      className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

const ResultsSection: React.FC<ResultsSectionProps> = ({ results, activeTab }) => {
  const { toast } = useToast();
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    userAnswers: [],
    showResults: false,
    score: 0,
  });

  // Debug logging
  useEffect(() => {
    console.log('ResultsSection received results:', results);
    if (results?.summary) {
      console.log('Summary data:', results.summary);
    }
  }, [results]);

  // Initialize quiz state when results change
  useEffect(() => {
    if (results?.quiz?.quiz) {
      setQuizState({
        currentQuestion: 0,
        userAnswers: new Array(results.quiz.quiz.length).fill(null),
        showResults: false,
        score: 0,
      });
    }
  }, [results?.quiz]);

  const handleAnswerSelect = (answer: string) => {
    if (results?.quiz?.quiz) {
      const newUserAnswers = [...quizState.userAnswers];
      newUserAnswers[quizState.currentQuestion] = answer;
      
      setQuizState(prev => ({
        ...prev,
        userAnswers: newUserAnswers,
      }));
    }
  };

  const handleNextQuestion = () => {
    if (results?.quiz?.quiz && quizState.currentQuestion < results.quiz.quiz.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (quizState.currentQuestion > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  };

  const handleFinishQuiz = () => {
    if (results?.quiz?.quiz) {
      let score = 0;
      results.quiz.quiz.forEach((question, index) => {
        if (quizState.userAnswers[index] === question.correct_answer) {
          score++;
        }
      });
      
      setQuizState(prev => ({
        ...prev,
        showResults: true,
        score,
      }));
    }
  };

  const handleRestartQuiz = () => {
    if (results?.quiz?.quiz) {
      setQuizState({
        currentQuestion: 0,
        userAnswers: new Array(results.quiz.quiz.length).fill(null),
        showResults: false,
        score: 0,
      });
    }
  };

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

  // Check if we have any content to show
  const hasAnyContent = results.summary || results.mindmap || results.quiz || results.flashcards;

  if (!hasAnyContent) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Your Learning Resources</h2>
            <p className="text-muted-foreground">
              Generate some content to see your AI-generated learning resources here
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
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
              <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
              <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
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
                  <div className="space-y-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-foreground">Original Content</h4>
                      <p className="text-sm text-muted-foreground">
                        {results.summary.original_text}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4 text-foreground">Summary</h4>
                      <div className="bg-background/50 p-6 rounded-lg border border-border/50">
                        <MarkdownRenderer content={results.summary.summary} />
                      </div>
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
                    <p>No summary available. Generate a summary to see it here.</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="quiz">
              {results.quiz ? (
                <div className="space-y-6">
                  {!quizState.showResults ? (
                    // Quiz Interface
                    <Card className="p-8 bg-gradient-card shadow-card border-0">
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold text-foreground">Quiz</h3>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              Question {quizState.currentQuestion + 1} of {results.quiz.quiz.length}
                            </span>
                            <div className="flex gap-1">
                              {results.quiz.quiz.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${
                                    index === quizState.currentQuestion
                                      ? 'bg-primary'
                                      : quizState.userAnswers[index] !== null
                                      ? 'bg-green-500'
                                      : 'bg-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold mb-4 text-foreground">
                            {results.quiz.quiz[quizState.currentQuestion].question}
                          </h4>
                          <div className="space-y-3">
                            {results.quiz.quiz[quizState.currentQuestion].options.map((option, optIndex) => (
                              <button
                                key={optIndex}
                                onClick={() => handleAnswerSelect(option)}
                                className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                                  quizState.userAnswers[quizState.currentQuestion] === option
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                }`}
                              >
                                <span className="font-medium mr-3">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={handlePreviousQuestion}
                            disabled={quizState.currentQuestion === 0}
                          >
                            Previous
                          </Button>
                          
                          {quizState.currentQuestion === results.quiz.quiz.length - 1 ? (
                            <Button
                              variant="hero"
                              onClick={handleFinishQuiz}
                              disabled={quizState.userAnswers[quizState.currentQuestion] === null}
                            >
                              Finish Quiz
                            </Button>
                          ) : (
                            <Button
                              variant="hero"
                              onClick={handleNextQuestion}
                              disabled={quizState.userAnswers[quizState.currentQuestion] === null}
                            >
                              Next Question
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    // Results Interface
                    <Card className="p-8 bg-gradient-card shadow-card border-0">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold mb-4 text-foreground">Quiz Results</h3>
                        <div className="text-4xl font-bold text-primary mb-2">
                          {quizState.score}/{results.quiz.quiz.length}
                        </div>
                        <div className="text-muted-foreground">
                          {Math.round((quizState.score / results.quiz.quiz.length) * 100)}% Score
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleRestartQuiz}
                          className="mt-4"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Retake Quiz
                        </Button>
                      </div>

                      <div className="space-y-6">
                        {results.quiz.quiz.map((question, index) => (
                          <Card key={index} className="p-6 bg-background/50 border border-border/50">
                            <div className="flex items-start gap-4">
                              <Badge 
                                variant={quizState.userAnswers[index] === question.correct_answer ? "default" : "destructive"}
                                className="mt-1"
                              >
                                {quizState.userAnswers[index] === question.correct_answer ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                Q{index + 1}
                              </Badge>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold mb-4 text-foreground">
                                  {question.question}
                                </h4>
                                <div className="space-y-2 mb-4">
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`p-3 rounded-lg border transition-colors ${
                                        option === question.correct_answer
                                          ? "border-green-500 bg-green-50 text-green-700"
                                          : option === quizState.userAnswers[index] && option !== question.correct_answer
                                          ? "border-red-500 bg-red-50 text-red-700"
                                          : "border-border bg-muted/30"
                                      }`}
                                    >
                                      <span className="text-sm font-medium mr-3">
                                        {String.fromCharCode(65 + optIndex)}.
                                      </span>
                                      {option}
                                      {option === question.correct_answer && (
                                        <CheckCircle className="h-4 w-4 ml-2 inline text-green-600" />
                                      )}
                                      {option === quizState.userAnswers[index] && option !== question.correct_answer && (
                                        <XCircle className="h-4 w-4 ml-2 inline text-red-600" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium text-blue-600 mb-1">Explanation:</p>
                                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </Card>
                  )}
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
                  <InteractiveMindmap data={results.mindmap} />
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