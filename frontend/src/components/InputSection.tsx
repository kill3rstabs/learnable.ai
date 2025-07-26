import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Link, 
  Type, 
  Play, 
  FileText, 
  AlertTriangle, 
  Loader2, 
  X, 
  File, 
  Brain, 
  HelpCircle, 
  BookOpen,
  Trash2,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApiKey } from "@/hooks/useApiKey";
import FileUpload from "@/components/ui/file-upload";
import { SUPPORTED_FILE_TYPES } from "@/lib/constants";
import type { useFileUpload } from "@/hooks/useFileUpload";
import type { useProcessing } from "@/hooks/useProcessing";
import type { ProcessingResults } from "@/lib/types";
import ResultsSection from "@/components/ResultsSection";

type InputSectionProps = ReturnType<typeof useFileUpload> &
  ReturnType<typeof useProcessing> &
  { results: ProcessingResults | null };

const InputSection: React.FC<InputSectionProps> = ({
  uploadedFiles,
  isDragOver,
  fileInputRef,
  handleFileSelect,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileInputChange,
  removeFile,
  clearFiles,
  processingStatus,
  summarizeTextMutation,
  processMultimediaMutation,
  summarizeMultimediaMutation,
  generateMindmapMutation,
  generateQuizMutation,
  generateFlashcardsMutation,
  results,
}) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [inputMethod, setInputMethod] = useState<"text" | "file" | "url">("text");
  const { toast } = useToast();
  
  // Custom hooks
  const { hasApiKey, validateApiKey } = useApiKey();

  // Check if processing is in progress
  const isProcessing = processingStatus.state === 'processing' || processingStatus.state === 'uploading';

  // Handle content generation based on active tab and input method
  const handleGenerateContent = () => {
    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your Gemini API key in Settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      validateApiKey();
      
      switch (activeTab) {
        case "summary":
          if (inputMethod === "text" && textInput.trim()) {
            summarizeTextMutation.mutate({ text: textInput });
          } else if (inputMethod === "file" && uploadedFiles.length > 0) {
            summarizeMultimediaMutation.mutate(undefined);
          } else {
            toast({
              title: "Input Required",
              description: "Please provide text or upload files to generate a summary.",
              variant: "destructive",
            });
          }
          break;
          
        case "mindmap":
          if (inputMethod === "text" && textInput.trim()) {
            generateMindmapMutation.mutate({ topic: textInput });
          } else if (inputMethod === "file" && uploadedFiles.length > 0) {
            generateMindmapMutation.mutate(undefined);
          } else {
            toast({
              title: "Input Required",
              description: "Please provide text or upload files to create a mindmap.",
              variant: "destructive",
            });
          }
          break;
          
        case "quiz":
          if (inputMethod === "text" && textInput.trim()) {
            generateQuizMutation.mutate({ content: textInput, num_questions: 10 });
          } else if (inputMethod === "file" && uploadedFiles.length > 0) {
            generateQuizMutation.mutate({ content: undefined, numQuestions: 10 });
          } else {
            toast({
              title: "Input Required",
              description: "Please provide text or upload files to generate a quiz.",
              variant: "destructive",
            });
          }
          break;
          
        case "flashcards":
          if (inputMethod === "text" && textInput.trim()) {
            generateFlashcardsMutation.mutate({ content: textInput });
          } else if (inputMethod === "file" && uploadedFiles.length > 0) {
            generateFlashcardsMutation.mutate("");
          } else {
            toast({
              title: "Input Required",
              description: "Please provide text or upload files to generate flashcards.",
              variant: "destructive",
            });
          }
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Check if current input method has content
  const hasContent = () => {
    switch (inputMethod) {
      case "text":
        return textInput.trim().length > 0;
      case "file":
        return uploadedFiles.length > 0;
      case "url":
        return urlInput.trim().length > 0;
      default:
        return false;
    }
  };

  const hasResultsForTab = () => {
    if (!results) return false;
    switch (activeTab) {
      case "summary":
        return !!results.summary;
      case "mindmap":
        return !!results.mindmap;
      case "quiz":
        return !!results.quiz;
      case "flashcards":
        return !!results.flashcards;
      default:
        return false;
    }
  };

  // Get loading state for current tab
  const getLoadingState = () => {
    switch (activeTab) {
      case "summary":
        return summarizeTextMutation.isPending || summarizeMultimediaMutation.isPending;
      case "mindmap":
        return generateMindmapMutation.isPending;
      case "quiz":
        return generateQuizMutation.isPending;
      case "flashcards":
        return generateFlashcardsMutation.isPending;
      default:
        return false;
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Create Learning Resources</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your content and generate different types of learning materials on demand.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - File Upload & Input */}
          <Card className="p-6 bg-card shadow-elevated border-0">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-foreground">Input Content</h3>
              
              {/* Input Method Tabs */}
              <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Files
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <Label htmlFor="text-input" className="text-base font-medium">
                    Paste your content
                  </Label>
                  <Textarea
                    id="text-input"
                    placeholder="Paste your text content, lecture notes, or any educational material here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[300px] text-base resize-none"
                    disabled={isProcessing}
                  />
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <Label className="text-base font-medium">Upload Files</Label>
                  <FileUpload
                    uploadedFiles={uploadedFiles}
                    isDragOver={isDragOver}
                    onRemoveFile={removeFile}
                    onClearFiles={clearFiles}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    fileInputRef={fileInputRef}
                    onFileInputChange={handleFileInputChange}
                    acceptedTypes={SUPPORTED_FILE_TYPES.ALL}
                    multiple={true}
                    disabled={isProcessing}
                  />
                  
                  {/* File List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Uploaded Files:</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{file.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {file.extension}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <Label htmlFor="url-input" className="text-base font-medium">
                    Enter URL
                  </Label>
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://youtube.com/watch?v=... or any educational link"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Supports YouTube videos, educational websites, and online documents
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {!hasApiKey && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-800">
                  <strong>API Key Required:</strong> Please configure your Gemini API key in Settings.
                </p>
              </div>
            )}
          </Card>

          {/* Right Side - Content Generation */}
          <Card className="p-6 bg-card shadow-elevated border-0">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-foreground">Generate Content</h3>
              
              {/* Content Type Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="summary" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="mindmap" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Mindmap
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Quiz
                  </TabsTrigger>
                  <TabsTrigger value="flashcards" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Flashcards
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  {hasResultsForTab() ? (
                    <ResultsSection results={results} activeTab="summary" />
                  ) : (
                    <div className="text-center p-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h4 className="text-lg font-semibold mb-2">Generate Summary</h4>
                      <p className="text-sm text-muted-foreground mb-6">
                        Create a concise summary of your content with key points and insights.
                      </p>
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleGenerateContent}
                        disabled={!hasApiKey || isProcessing || !hasContent() || getLoadingState()}
                        className="w-full"
                      >
                        {getLoadingState() ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4 mr-2" />
                        )}
                        Generate Summary
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="mindmap" className="space-y-4">
                  {hasResultsForTab() ? (
                    <ResultsSection results={results} activeTab="mindmap" />
                  ) : (
                    <div className="text-center p-8">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h4 className="text-lg font-semibold mb-2">Create Mindmap</h4>
                      <p className="text-sm text-muted-foreground mb-6">
                        Visualize the main concepts and their relationships in your content.
                      </p>
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleGenerateContent}
                        disabled={!hasApiKey || isProcessing || !hasContent() || getLoadingState()}
                        className="w-full"
                      >
                        {getLoadingState() ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Brain className="h-4 w-4 mr-2" />
                        )}
                        Create Mindmap
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quiz" className="space-y-4">
                  {hasResultsForTab() ? (
                    <ResultsSection results={results} activeTab="quiz" />
                  ) : (
                    <div className="text-center p-8">
                      <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h4 className="text-lg font-semibold mb-2">Generate Quiz</h4>
                      <p className="text-sm text-muted-foreground mb-6">
                        Test your knowledge with interactive multiple-choice questions.
                      </p>
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleGenerateContent}
                        disabled={!hasApiKey || isProcessing || !hasContent() || getLoadingState()}
                        className="w-full"
                      >
                        {getLoadingState() ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <HelpCircle className="h-4 w-4 mr-2" />
                        )}
                        Generate Quiz
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="flashcards" className="space-y-4">
                  {hasResultsForTab() ? (
                    <ResultsSection results={results} activeTab="flashcards" />
                  ) : (
                    <div className="text-center p-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h4 className="text-lg font-semibold mb-2">Create Flashcards</h4>
                      <p className="text-sm text-muted-foreground mb-6">
                        Build study cards with key terms and concepts for effective memorization.
                      </p>
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleGenerateContent}
                        disabled={!hasApiKey || isProcessing || !hasContent() || getLoadingState()}
                        className="w-full"
                      >
                        {getLoadingState() ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <BookOpen className="h-4 w-4 mr-2" />
                        )}
                        Create Flashcards
                      </Button>
                    </div>
                  )}
                </TabsContent>

              </Tabs>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Processing...</p>
                    <p className="text-xs text-blue-600">{processingStatus.message}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default InputSection;