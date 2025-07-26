import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import InputSection from "@/components/InputSection";
import ResultsSection from "@/components/ResultsSection";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useProcessing } from "@/hooks/useProcessing";
import { useEffect } from "react";

const Index = () => {
  const fileUpload = useFileUpload();
  const processing = useProcessing(fileUpload.uploadedFiles);

  // Debug logging
  useEffect(() => {
    console.log('Index component - processing results:', processing.results);
  }, [processing.results]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <InputSection {...fileUpload} {...processing} />
      <ResultsSection results={processing.results} />
    </div>
  );
};

export default Index;
