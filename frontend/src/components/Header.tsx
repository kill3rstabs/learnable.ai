import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Sparkles } from "lucide-react";
import SettingsModal from "./SettingsModal";
import ApiKeyStatus from "./ApiKeyStatus";
const Header = () => {
  return <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-md">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Learnable.ai</h1>
              <p className="text-sm text-muted-foreground">Transform content into learning resources</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ApiKeyStatus />
            <SettingsModal />
            <Button variant="ghost" size="sm">
              <BookOpen className="h-4 w-4" />
              My Library
            </Button>
            <Button variant="hero" size="sm">
              <Sparkles className="h-4 w-4" />
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;