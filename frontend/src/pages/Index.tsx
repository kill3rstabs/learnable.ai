import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import InputSection from "@/components/InputSection";
import ResultsSection from "@/components/ResultsSection";
import { useProcessing } from "@/hooks/useProcessing";
import type { ProcessingResults } from "@/lib/types";

const Index = () => {
  const { results } = useProcessing();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <InputSection />
      <ResultsSection results={results} />
    </div>
  );
};

export default Index;
