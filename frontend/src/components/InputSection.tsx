import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link, Type, Play, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApiKey } from "@/hooks/useApiKey";
import FileUpload from "@/components/ui/file-upload";
import { SUPPORTED_FILE_TYPES } from "@/lib/constants";
import type { useFileUpload } from "@/hooks/useFileUpload";
import type { useProcessing } from "@/hooks/useProcessing";

type InputSectionProps = ReturnType<typeof useFileUpload> & ReturnType<typeof useProcessing>;

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
}) => {
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const { toast } = useToast();
  
  // Custom hooks
  const { hasApiKey, validateApiKey } = useApiKey();

  // Handle text processing
  const handleTextProcess = () => {
    if (!textInput.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to process.",
        variant: "destructive",
      });
      return;
    }

    try {
      validateApiKey();
      summarizeTextMutation.mutate({ text: textInput });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle file processing
  const handleFileProcess = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Files Required",
        description: "Please upload at least one file to process.",
        variant: "destructive",
      });
      return;
    }

    try {
      validateApiKey();
      processMultimediaMutation.mutate(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle URL processing (placeholder for future implementation)
  const handleUrlProcess = () => {
    if (!urlInput.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to process.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "URL Processing",
      description: "URL processing will be implemented in a future update.",
    });
  };

  // Check if processing is in progress
  const isProcessing = processingStatus.state === 'processing' || processingStatus.state === 'uploading';

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Start Creating Learning Resources</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose your input method and let our AI transform your content into structured learning materials.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto p-8 bg-card shadow-elevated border-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Text Input
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                URL/Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-6">
              <div>
                <Label htmlFor="text-input" className="text-base font-medium mb-3 block">
                  Paste your content here
                </Label>
                <Textarea
                  id="text-input"
                  placeholder="Paste your text content, lecture notes, or any educational material here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[200px] text-base resize-none"
                  disabled={isProcessing}
                />
              </div>
              
              {!hasApiKey && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    <strong>API Key Required:</strong> Please configure your Gemini API key in Settings to start processing content.
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1" 
                  disabled={!textInput.trim() || !hasApiKey || isProcessing}
                  onClick={handleTextProcess}
                >
                  {summarizeTextMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Type className="h-4 w-4 mr-2" />
                  )}
                  Generate Summary
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1" 
                  disabled={!textInput.trim() || !hasApiKey || isProcessing}
                  onClick={() => generateMindmapMutation.mutate({ topic: textInput })}
                >
                  {generateMindmapMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Create Mindmap
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1" 
                  disabled={!textInput.trim() || !hasApiKey || isProcessing}
                  onClick={() => generateQuizMutation.mutate({ content: textInput, num_questions: 10 })}
                >
                  {generateQuizMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Generate Quiz
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
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
              
              {!hasApiKey && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    <strong>API Key Required:</strong> Please configure your Gemini API key in Settings to start processing content.
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1" 
                  disabled={!hasApiKey || isProcessing || uploadedFiles.length === 0}
                  onClick={() => summarizeMultimediaMutation.mutate(undefined)}
                >
                  {summarizeMultimediaMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Type className="h-4 w-4 mr-2" />
                  )}
                  Generate Summary
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1" 
                  disabled={!hasApiKey || isProcessing || uploadedFiles.length === 0}
                  onClick={() => generateMindmapMutation.mutate(undefined)}
                >
                  {generateMindmapMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Create Mindmap
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1" 
                  disabled={!hasApiKey || isProcessing || uploadedFiles.length === 0}
                  onClick={() => generateQuizMutation.mutate({ content: undefined, numQuestions: 10 })}
                >
                  {generateQuizMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Generate Quiz
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-6">
              <div>
                <Label htmlFor="url-input" className="text-base font-medium mb-3 block">
                  Enter URL or link
                </Label>
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or any educational link"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="text-base"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Supports YouTube videos, educational websites, and online documents
                </p>
              </div>
              
              {!hasApiKey && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    <strong>API Key Required:</strong> Please configure your Gemini API key in Settings to start processing content.
                  </p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                disabled={!urlInput.trim() || !hasApiKey || isProcessing}
                onClick={handleUrlProcess}
              >
                <Play className="h-5 w-5" />
                Process Link
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </section>
  );
};

export default InputSection;