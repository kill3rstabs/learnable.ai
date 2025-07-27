import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, AlertTriangle, Loader2, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { SUPPORTED_FILE_TYPES } from "@/lib/constants";
import { 
  MCQQuestion, 
  Flashcard, 
  MindmapNode 
} from "@/lib/types";

// Custom types for our dashboard
interface CustomResult {
  id: string;
  type: 'summary' | 'mindmap' | 'quiz' | 'flashcards';
  title: string;
  timestamp: string;
  data: any;
}

interface SummaryResult {
  summary: string;
  original_text: string;
}

interface MindmapResult {
  topic: string;
  mindmap: MindmapNode;
}

interface QuizResult {
  content: string;
  quiz: MCQQuestion[];
}

interface FlashcardsResult {
  flashcards: Flashcard[];
  content: string;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState("summarize");
  const [contentTab, setContentTab] = useState("text");
  const [inputText, setInputText] = useState("");
  const [topic, setTopic] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<CustomResult[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    
    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser.isLoggedIn) {
        navigate("/login");
        return;
      }
      setUser(parsedUser);
      
      // Load saved results from localStorage if available
      const savedResults = localStorage.getItem("learningResults");
      if (savedResults) {
        try {
          setResults(JSON.parse(savedResults));
        } catch (e) {
          console.error("Failed to parse saved results", e);
        }
      }
    } catch (e) {
      navigate("/login");
    }
  }, [navigate]);

  // Save results to localStorage when they change
  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem("learningResults", JSON.stringify(results));
    }
  }, [results]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // File upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      addUploadedFiles(fileList);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addUploadedFiles = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      addUploadedFiles(fileList);
    }
  };

  // Process inputs based on active tab
  const handleSubmit = async () => {
    setIsProcessing(true);
    
    try {
      switch (activeTab) {
        case "summarize":
          await handleSummarize();
          break;
          
        case "mindmap":
          await handleMindmap();
          break;
          
        case "quiz":
          await handleQuiz();
          break;
          
        case "flashcards":
          await handleFlashcards();
          break;
      }
      
      toast({ 
        title: "Success", 
        description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} generated successfully` 
      });
      
      // Clear input fields after successful submission
      if (contentTab === "text") {
        if (activeTab === 'mindmap') {
          setTopic("");
        } else {
          setInputText("");
        }
      } else if (contentTab === "url") {
        setUrlInput("");
      } else if (contentTab === "upload") {
        clearFiles();
      }
      
    } catch (error) {
      console.error("Processing error:", error);
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to process your request", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle summarize based on content tab
  const handleSummarize = async () => {
    if (contentTab === "text") {
      if (!inputText.trim()) {
        throw new Error("Please enter text to summarize");
      }
      
      const response = await apiClient.summarizeContent({ text: inputText });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate summary");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'summary',
        title: `Summary: ${inputText.substring(0, 30)}...`,
        timestamp: new Date().toISOString(),
        data: response.data as SummaryResult
      }, ...prev]);
    } 
    else if (contentTab === "upload") {
      if (uploadedFiles.length === 0) {
        throw new Error("Please upload a file to summarize");
      }
      
      const response = await apiClient.summarizeContent({ 
        files: uploadedFiles.map(file => ({ file: file.file })) 
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate summary");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'summary',
        title: `Summary: ${uploadedFiles[0].name}`,
        timestamp: new Date().toISOString(),
        data: response.data as SummaryResult
      }, ...prev]);
    }
    else if (contentTab === "url") {
      if (!urlInput.trim()) {
        throw new Error("Please enter a URL to summarize");
      }
      
      const response = await apiClient.summarizeContent({ youtubeUrl: urlInput });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate summary");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'summary',
        title: `Summary: ${urlInput}`,
        timestamp: new Date().toISOString(),
        data: response.data as SummaryResult
      }, ...prev]);
    }
  };

  // Handle mindmap based on content tab
  const handleMindmap = async () => {
    if (contentTab === "text") {
      if (!topic.trim()) {
        throw new Error("Please enter a topic for the mindmap");
      }
      
      const response = await apiClient.createMindmap({ topic });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate mindmap");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'mindmap',
        title: `Mindmap: ${topic}`,
        timestamp: new Date().toISOString(),
        data: response.data as MindmapResult
      }, ...prev]);
    }
    else if (contentTab === "upload") {
      if (uploadedFiles.length === 0) {
        throw new Error("Please upload a file to create a mindmap");
      }
      
      const response = await apiClient.createMindmap({ 
        files: uploadedFiles.map(file => ({ file: file.file })) 
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate mindmap");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'mindmap',
        title: `Mindmap: ${uploadedFiles[0].name}`,
        timestamp: new Date().toISOString(),
        data: response.data as MindmapResult
      }, ...prev]);
    }
    else if (contentTab === "url") {
      if (!urlInput.trim()) {
        throw new Error("Please enter a URL to create a mindmap");
      }
      
      const response = await apiClient.createMindmap({ youtubeUrl: urlInput });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate mindmap");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'mindmap',
        title: `Mindmap: ${urlInput}`,
        timestamp: new Date().toISOString(),
        data: response.data as MindmapResult
      }, ...prev]);
    }
  };

  // Handle quiz based on content tab
  const handleQuiz = async () => {
    if (contentTab === "text") {
      if (!inputText.trim()) {
        throw new Error("Please enter content for the quiz");
      }
      
      const response = await apiClient.createMCQQuiz({ 
        content: inputText,
        num_questions: numQuestions
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate quiz");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'quiz',
        title: `Quiz: ${inputText.substring(0, 30)}...`,
        timestamp: new Date().toISOString(),
        data: response.data as QuizResult
      }, ...prev]);
    }
    else if (contentTab === "upload") {
      if (uploadedFiles.length === 0) {
        throw new Error("Please upload a file to create a quiz");
      }
      
      const response = await apiClient.createMCQQuiz({ 
        files: uploadedFiles.map(file => ({ file: file.file })),
        num_questions: numQuestions
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate quiz");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'quiz',
        title: `Quiz: ${uploadedFiles[0].name}`,
        timestamp: new Date().toISOString(),
        data: response.data as QuizResult
      }, ...prev]);
    }
    else if (contentTab === "url") {
      if (!urlInput.trim()) {
        throw new Error("Please enter a URL to create a quiz");
      }
      
      const response = await apiClient.createMCQQuiz({ 
        youtubeUrl: urlInput,
        num_questions: numQuestions
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate quiz");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'quiz',
        title: `Quiz: ${urlInput}`,
        timestamp: new Date().toISOString(),
        data: response.data as QuizResult
      }, ...prev]);
    }
  };

  // Handle flashcards based on content tab
  const handleFlashcards = async () => {
    if (contentTab === "text") {
      if (!inputText.trim()) {
        throw new Error("Please enter content for flashcards");
      }
      
      const response = await apiClient.createFlashcards({ content: inputText });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate flashcards");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'flashcards',
        title: `Flashcards: ${inputText.substring(0, 30)}...`,
        timestamp: new Date().toISOString(),
        data: response.data as FlashcardsResult
      }, ...prev]);
    }
    else if (contentTab === "upload") {
      if (uploadedFiles.length === 0) {
        throw new Error("Please upload a file to create flashcards");
      }
      
      const response = await apiClient.createFlashcards({ 
        files: uploadedFiles.map(file => ({ file: file.file }))
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate flashcards");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'flashcards',
        title: `Flashcards: ${uploadedFiles[0].name}`,
        timestamp: new Date().toISOString(),
        data: response.data as FlashcardsResult
      }, ...prev]);
    }
    else if (contentTab === "url") {
      if (!urlInput.trim()) {
        throw new Error("Please enter a URL to create flashcards");
      }
      
      const response = await apiClient.createFlashcards({ youtubeUrl: urlInput });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate flashcards");
      }
      
      setResults(prev => [{
        id: Date.now().toString(),
        type: 'flashcards',
        title: `Flashcards: ${urlInput}`,
        timestamp: new Date().toISOString(),
        data: response.data as FlashcardsResult
      }, ...prev]);
    }
  };

  // Delete a result
  const handleDeleteResult = (id: string) => {
    setResults(prev => prev.filter(result => result.id !== id));
  };

  if (!user) return null; // Wait for auth check

  // Render different result views based on type
  const renderResult = (result: CustomResult) => {
    switch (result.type) {
      case 'summary':
        const summaryData = result.data as SummaryResult;
        return (
          <Card key={result.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Summary</span>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteResult(result.id)}>×</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Summary</h3>
                  <div className="bg-muted p-4 rounded-md">{summaryData.summary}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Original Text</h3>
                  <div className="bg-muted p-4 rounded-md max-h-40 overflow-y-auto text-sm">
                    {summaryData.original_text}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'mindmap':
        const mindmapData = result.data as MindmapResult;
        return (
          <Card key={result.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Mindmap: {mindmapData.topic}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteResult(result.id)}>×</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] border rounded-md p-4">
                {/* Here we would render the mindmap visualization component */}
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p>Mindmap visualization</p>
                    <p className="text-sm">Topic: {mindmapData.topic}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'quiz':
        const quizData = result.data as QuizResult;
        return (
          <Card key={result.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Quiz ({quizData.quiz.length} Questions)</span>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteResult(result.id)}>×</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizData.quiz.slice(0, 3).map((q, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Q{index + 1}: {q.question}</h3>
                    <ul className="space-y-1">
                      {q.options.map((option, optIndex) => (
                        <li key={optIndex} className="text-sm">
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {option === q.correct_answer && " ✓"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {quizData.quiz.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    + {quizData.quiz.length - 3} more questions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
        
      case 'flashcards':
        const flashcardsData = result.data as FlashcardsResult;
        return (
          <Card key={result.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Flashcards ({flashcardsData.flashcards.length})</span>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteResult(result.id)}>×</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flashcardsData.flashcards.slice(0, 3).map((card, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted p-3 rounded-md">
                        <h3 className="text-xs text-muted-foreground mb-1">Front</h3>
                        <p className="text-sm">{card.front}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <h3 className="text-xs text-muted-foreground mb-1">Back</h3>
                        <p className="text-sm">{card.back}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {flashcardsData.flashcards.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    + {flashcardsData.flashcards.length - 3} more flashcards
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };

  // File upload component
  const FileUploadComponent = () => (
    <div 
      className={`border-2 border-dashed rounded-md p-6 transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="font-medium">Drag & drop files here</h3>
          <p className="text-sm text-muted-foreground">
            Supports audio, video, PDFs, Word documents, and text files
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          Select Files
        </Button>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept={SUPPORTED_FILE_TYPES.ALL.join(',')}
          multiple
          disabled={isProcessing}
        />
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Uploaded Files</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFiles}
              disabled={isProcessing}
            >
              Clear All
            </Button>
          </div>
          
          <ul className="space-y-2">
            {uploadedFiles.map((file) => (
              <li key={file.id} className="bg-muted p-2 rounded-md flex items-center justify-between">
                <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => removeFile(file.id)}
                  disabled={isProcessing}
                >
                  <X className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/brain.png" alt="Learnable.ai Logo" className="w-8 h-8" />
            <h1 className="text-xl font-bold">Learnable.ai</h1>
          </div>
          <div className="flex items-center gap-4">
            <span>Welcome, {user.name}</span>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Learning Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Learning Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="summarize">Summarize</TabsTrigger>
                    <TabsTrigger value="mindmap">Mindmap</TabsTrigger>
                    <TabsTrigger value="quiz">Quiz</TabsTrigger>
                    <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                  </TabsList>
                  
                  <div className="mb-6">
                    <Tabs value={contentTab} onValueChange={setContentTab}>
                      <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="text">Text Input</TabsTrigger>
                        <TabsTrigger value="upload">File Upload</TabsTrigger>
                        <TabsTrigger value="url">URL/Link</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="text" className="mt-4">
                        {activeTab === "mindmap" ? (
                          <div>
                            <Label htmlFor="topic-input">Enter a topic</Label>
                            <Input 
                              id="topic-input"
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              placeholder="Enter a topic for your mindmap..."
                              className="mb-2"
                            />
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="text-input">Enter content</Label>
                            <Textarea 
                              id="text-input"
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              placeholder="Enter your content here..."
                              className="min-h-[150px]"
                            />
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="upload" className="mt-4">
                        <FileUploadComponent />
                      </TabsContent>
                      
                      <TabsContent value="url" className="mt-4">
                        <div>
                          <Label htmlFor="url-input">Enter URL</Label>
                          <Input 
                            id="url-input"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            type="url"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Works best with YouTube URLs
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    {activeTab === "quiz" && (
                      <div className="w-1/3">
                        <Label htmlFor="num-questions" className="text-sm">Number of questions</Label>
                        <Select 
                          value={String(numQuestions)} 
                          onValueChange={(val) => setNumQuestions(Number(val))}
                        >
                          <SelectTrigger id="num-questions">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 questions</SelectItem>
                            <SelectItem value="5">5 questions</SelectItem>
                            <SelectItem value="7">7 questions</SelectItem>
                            <SelectItem value="10">10 questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <Button 
                      className={activeTab === "quiz" ? "w-2/3" : "w-full"}
                      onClick={handleSubmit}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {activeTab === "summarize" && "Generate Summary"}
                          {activeTab === "mindmap" && "Create Mindmap"}
                          {activeTab === "quiz" && "Generate Quiz"}
                          {activeTab === "flashcards" && "Create Flashcards"}
                        </>
                      )}
                    </Button>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Learning</CardTitle>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Your recent learning activities will appear here.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {results.slice(0, 5).map(result => (
                      <li 
                        key={result.id} 
                        className="text-sm p-2 hover:bg-accent rounded cursor-pointer"
                        onClick={() => {
                          // Scroll to that result if needed
                          document.getElementById(`result-${result.id}`)?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'center'
                          });
                        }}
                      >
                        {result.title}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Results section */}
        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Results</h2>
            <div className="space-y-6">
              {results.map(result => (
                <div id={`result-${result.id}`} key={result.id}>
                  {renderResult(result)}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
